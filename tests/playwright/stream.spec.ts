import { test, expect, type Page } from '@playwright/test'
import { installSfuMock, offerSdpToAnswer, type SfuSignal } from './sfu-mock'

// Test tunables — small enough to make the suite fast, large enough that the
// short-circuit assertions can't pass by coincidence.
const FAST_BACKOFF = {
  baseBackoffMs: 20,
  maxBackoffMs: 30,
  maxJitterMs: 0,
} as const

// Long backoff used to prove the visibility/online handlers actually
// short-circuit rather than just happening to fire inside the natural window.
const SLOW_BACKOFF = {
  baseBackoffMs: 5_000,
  maxBackoffMs: 5_000,
  maxJitterMs: 0,
} as const

async function gotoHarness(page: Page): Promise<void> {
  await page.goto('/test-harness.html')
  // Sanity: the harness API must be ready before any test interacts with it.
  await page.waitForFunction(() => Boolean(window.__sfu))
}

test.describe('SpaceStreamManager', () => {
  test.beforeEach(({ page }) => {
    // Surface in-browser errors in the Playwright report so failing tests are
    // debuggable without re-running with --debug.
    page.on('pageerror', (err) => {
      console.error('[page error]', err.message)
    })
    page.on('console', (msg) => {
      if (msg.type() === 'error') console.error('[page console]', msg.text())
    })
  })

  test('sends the initial offer over the websocket once started', async ({
    page,
  }) => {
    const sfu = await installSfuMock(page)
    await gotoHarness(page)

    await page.evaluate(({ url }) => window.__sfu.start(url), { url: sfu.url })

    await expect
      .poll(() => sfu.received.filter((s) => s.type === 'offer').length)
      .toBe(1)
    expect(sfu.sockets).toHaveLength(1)

    const log = await page.evaluate(() => window.__sfu.getStatusLog())
    expect(log[0]).toBe('connecting')
  })

  test('accepts the server answer without errors', async ({ page }) => {
    const sfu = await installSfuMock(page)
    await gotoHarness(page)

    await page.evaluate(({ url }) => window.__sfu.start(url), { url: sfu.url })

    // The mock auto-answers; we just verify no transition into reconnecting,
    // which would indicate setRemoteDescription failed.
    await page.waitForTimeout(200)
    const status = await page.evaluate(() => window.__sfu.getStatus())
    expect(status).toBe('connecting')
  })

  test('answers a server-initiated renegotiation offer', async ({ page }) => {
    const sfu = await installSfuMock(page)
    sfu.setAutoAnswer(false)
    await gotoHarness(page)

    await page.evaluate(({ url }) => window.__sfu.start(url), { url: sfu.url })

    // Wait for the client offer, then drive the handshake manually.
    await expect
      .poll(() => sfu.received.filter((s) => s.type === 'offer').length)
      .toBe(1)
    const clientOffer = sfu.received.find(
      (s) => s.type === 'offer',
    ) as SfuSignal
    sfu.push({ type: 'answer', sdp: offerSdpToAnswer(clientOffer.sdp!) })

    sfu.clearReceived()
    // Server-driven renegotiation: push the same SDP back as a fresh offer.
    sfu.push({ type: 'offer', sdp: clientOffer.sdp! })

    await expect
      .poll(() => sfu.received.filter((s) => s.type === 'answer').length)
      .toBe(1)
  })

  test('forwards peer_joined and peer_left events to listeners', async ({
    page,
  }) => {
    const sfu = await installSfuMock(page)
    await gotoHarness(page)

    await page.evaluate(({ url }) => window.__sfu.start(url), { url: sfu.url })
    await expect.poll(() => sfu.sockets.length).toBe(1)

    sfu.push({ type: 'peer_joined', peer_id: 'alice' })
    sfu.push({ type: 'peer_joined', peer_id: 'bob' })
    sfu.push({ type: 'peer_left', peer_id: 'alice' })

    await expect
      .poll(() => page.evaluate(() => window.__sfu.getPeerJoinedLog()))
      .toEqual(['alice', 'bob'])
    await expect
      .poll(() => page.evaluate(() => window.__sfu.getPeerLeftLog()))
      .toEqual(['alice'])
  })

  test('stops fully when the host sends space_ended', async ({ page }) => {
    const sfu = await installSfuMock(page)
    await gotoHarness(page)

    await page.evaluate(
      ({ url, opts }) => window.__sfu.start(url, { managerOptions: opts }),
      { url: sfu.url, opts: FAST_BACKOFF },
    )
    await expect.poll(() => sfu.sockets.length).toBe(1)

    sfu.push({ type: 'space_ended', message: 'host left' })

    await expect
      .poll(() => page.evaluate(() => window.__sfu.getEndedMessage()))
      .toBe('host left')
    await expect
      .poll(() => page.evaluate(() => window.__sfu.getStatus()))
      .toBe('idle')

    // No reconnection should occur after an intentional space end.
    await page.waitForTimeout(150)
    expect(sfu.sockets).toHaveLength(1)
  })

  test('reconnects automatically when the websocket drops unexpectedly', async ({
    page,
  }) => {
    const sfu = await installSfuMock(page)
    await gotoHarness(page)

    await page.evaluate(
      ({ url, opts }) => window.__sfu.start(url, { managerOptions: opts }),
      { url: sfu.url, opts: FAST_BACKOFF },
    )
    await expect.poll(() => sfu.sockets.length).toBe(1)

    sfu.dropLast()

    await expect
      .poll(() => page.evaluate(() => window.__sfu.getStatus()))
      .toBe('reconnecting')

    // A fresh socket appears once the manager retries.
    await expect.poll(() => sfu.sockets.length).toBeGreaterThanOrEqual(2)
    await expect
      .poll(() => sfu.received.filter((s) => s.type === 'offer').length)
      .toBeGreaterThanOrEqual(2)
  })

  test('does not reconnect after an intentional stop()', async ({ page }) => {
    const sfu = await installSfuMock(page)
    await gotoHarness(page)

    await page.evaluate(
      ({ url, opts }) => window.__sfu.start(url, { managerOptions: opts }),
      { url: sfu.url, opts: FAST_BACKOFF },
    )
    await expect.poll(() => sfu.sockets.length).toBe(1)

    await page.evaluate(() => window.__sfu.stop())
    await expect
      .poll(() => page.evaluate(() => window.__sfu.getStatus()))
      .toBe('idle')

    // Even after long enough for several backoff windows, no new connection.
    await page.waitForTimeout(200)
    expect(sfu.sockets).toHaveLength(1)
  })

  test('reports failed after exhausting max reconnect attempts', async ({
    page,
  }) => {
    const sfu = await installSfuMock(page)
    await gotoHarness(page)

    await page.evaluate(
      ({ url, opts }) =>
        window.__sfu.start(url, {
          managerOptions: { ...opts, maxReconnectAttempts: 2 },
        }),
      { url: sfu.url, opts: FAST_BACKOFF },
    )
    await expect.poll(() => sfu.sockets.length).toBe(1)

    // Every subsequent reconnect attempt is rejected immediately.
    sfu.setDropOnConnect(true)
    sfu.dropLast()

    await expect
      .poll(() => page.evaluate(() => window.__sfu.getStatus()), {
        timeout: 3_000,
      })
      .toBe('failed')

    // Initial + 2 retries.
    expect(sfu.sockets.length).toBe(3)
  })

  test('visibilitychange short-circuits the reconnect backoff', async ({
    page,
  }) => {
    const sfu = await installSfuMock(page)
    await gotoHarness(page)

    await page.evaluate(
      ({ url, opts }) => window.__sfu.start(url, { managerOptions: opts }),
      { url: sfu.url, opts: SLOW_BACKOFF },
    )
    await expect.poll(() => sfu.sockets.length).toBe(1)

    sfu.dropLast()
    await expect
      .poll(() => page.evaluate(() => window.__sfu.getStatus()))
      .toBe('reconnecting')

    const t0 = Date.now()
    await page.evaluate(() =>
      document.dispatchEvent(new Event('visibilitychange')),
    )

    // Reconnect should happen well within the 5s natural backoff window.
    await expect
      .poll(() => sfu.sockets.length, { timeout: 2_000 })
      .toBeGreaterThanOrEqual(2)
    expect(Date.now() - t0).toBeLessThan(2_000)
  })

  test('online event short-circuits the reconnect backoff', async ({
    page,
  }) => {
    const sfu = await installSfuMock(page)
    await gotoHarness(page)

    await page.evaluate(
      ({ url, opts }) => window.__sfu.start(url, { managerOptions: opts }),
      { url: sfu.url, opts: SLOW_BACKOFF },
    )
    await expect.poll(() => sfu.sockets.length).toBe(1)

    sfu.dropLast()
    await expect
      .poll(() => page.evaluate(() => window.__sfu.getStatus()))
      .toBe('reconnecting')

    const t0 = Date.now()
    await page.evaluate(() => window.dispatchEvent(new Event('online')))

    await expect
      .poll(() => sfu.sockets.length, { timeout: 2_000 })
      .toBeGreaterThanOrEqual(2)
    expect(Date.now() - t0).toBeLessThan(2_000)
  })

  test('invokes the token provider on every connection attempt', async ({
    page,
  }) => {
    const sfu = await installSfuMock(page)
    await gotoHarness(page)

    await page.evaluate(
      ({ url, opts }) =>
        window.__sfu.start(url, {
          tokens: ['t1', 't2', 't3'],
          managerOptions: opts,
        }),
      { url: sfu.url, opts: FAST_BACKOFF },
    )

    expect(await page.evaluate(() => window.__sfu.getTokenCalls())).toBe(1)

    sfu.dropLast()
    await expect.poll(() => sfu.sockets.length).toBeGreaterThanOrEqual(2)
    await expect
      .poll(() => page.evaluate(() => window.__sfu.getTokenCalls()))
      .toBeGreaterThanOrEqual(2)
  })

  test('toggleMute flips the local audio track enabled flag', async ({
    page,
  }) => {
    const sfu = await installSfuMock(page)
    await gotoHarness(page)

    await page.evaluate(({ url }) => window.__sfu.start(url), { url: sfu.url })

    await expect
      .poll(() => page.evaluate(() => window.__sfu.getMicEnabled()))
      .toBe(true)

    await page.evaluate(() => window.__sfu.toggleMute(true))
    expect(await page.evaluate(() => window.__sfu.getMicEnabled())).toBe(false)

    await page.evaluate(() => window.__sfu.toggleMute(false))
    expect(await page.evaluate(() => window.__sfu.getMicEnabled())).toBe(true)
  })

  test('sendEndSpace transmits end_space on the wire', async ({ page }) => {
    const sfu = await installSfuMock(page)
    await gotoHarness(page)

    await page.evaluate(({ url }) => window.__sfu.start(url), { url: sfu.url })
    await expect.poll(() => sfu.sockets.length).toBe(1)

    sfu.clearReceived()
    await page.evaluate(() => window.__sfu.sendEndSpace())

    await expect
      .poll(() => sfu.received.filter((s) => s.type === 'end_space').length)
      .toBe(1)
  })

  test('preserves the local mic stream across a reconnect', async ({
    page,
  }) => {
    const sfu = await installSfuMock(page)
    await gotoHarness(page)

    await page.evaluate(
      ({ url, opts }) => window.__sfu.start(url, { managerOptions: opts }),
      { url: sfu.url, opts: FAST_BACKOFF },
    )
    await expect.poll(() => sfu.sockets.length).toBe(1)

    // Mute pre-reconnect — this state should survive a transient drop because
    // the manager reuses the same MediaStreamTrack.
    await page.evaluate(() => window.__sfu.toggleMute(true))
    expect(await page.evaluate(() => window.__sfu.getMicEnabled())).toBe(false)

    sfu.dropLast()
    await expect.poll(() => sfu.sockets.length).toBeGreaterThanOrEqual(2)

    // Track is still the same one — still disabled.
    expect(await page.evaluate(() => window.__sfu.getMicEnabled())).toBe(false)
  })
})
