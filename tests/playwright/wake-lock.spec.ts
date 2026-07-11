import { test, expect, type Page } from '@playwright/test'
import { installSfuMock } from './sfu-mock'

// Replace navigator.wakeLock with a spy so we can observe request/release
// without depending on real platform wake-lock behaviour in headless Chromium.
async function installFakeWakeLock(page: Page): Promise<void> {
  await page.addInitScript(() => {
    const state = { requests: 0, releases: 0 }
    ;(window as unknown as { __wakeLockStats: () => typeof state }).__wakeLockStats =
      () => ({ ...state })

    const wakeLock = {
      request: async () => {
        state.requests += 1
        const handlers: Record<string, Array<() => void>> = {}
        return {
          released: false,
          type: 'screen' as const,
          release() {
            this.released = true
            state.releases += 1
            ;(handlers['release'] ?? []).forEach((fn) => fn())
            return Promise.resolve()
          },
          addEventListener(ev: string, cb: () => void) {
            ;(handlers[ev] ??= []).push(cb)
          },
          removeEventListener() {},
          dispatchEvent() {
            return true
          },
        }
      },
    }
    Object.defineProperty(navigator, 'wakeLock', {
      configurable: true,
      get: () => wakeLock,
    })
  })
}

async function gotoHarness(page: Page): Promise<void> {
  await page.goto('/test-harness.html')
  await page.waitForFunction(() => Boolean(window.__sfu))
}

const wakeLockStats = (page: Page) =>
  page.evaluate(
    () =>
      (
        window as unknown as {
          __wakeLockStats: () => { requests: number; releases: number }
        }
      ).__wakeLockStats(),
  )

test.describe('Screen wake lock', () => {
  test('is acquired when hosting with keepScreenAwake', async ({ page }) => {
    await installFakeWakeLock(page)
    const sfu = await installSfuMock(page)
    await gotoHarness(page)

    await page.evaluate(
      ({ url }) =>
        window.__sfu.start(url, {
          managerOptions: { keepScreenAwake: true },
        }),
      { url: sfu.url },
    )

    await expect
      .poll(async () => (await wakeLockStats(page)).requests)
      .toBeGreaterThanOrEqual(1)
  })

  test('is not acquired by default (listeners do not keep the screen lit)', async ({
    page,
  }) => {
    await installFakeWakeLock(page)
    const sfu = await installSfuMock(page)
    await gotoHarness(page)

    await page.evaluate(({ url }) => window.__sfu.start(url), { url: sfu.url })

    await page.waitForTimeout(200)
    expect((await wakeLockStats(page)).requests).toBe(0)
  })

  test('is released on stop', async ({ page }) => {
    await installFakeWakeLock(page)
    const sfu = await installSfuMock(page)
    await gotoHarness(page)

    await page.evaluate(
      ({ url }) =>
        window.__sfu.start(url, {
          managerOptions: { keepScreenAwake: true },
        }),
      { url: sfu.url },
    )
    await expect
      .poll(async () => (await wakeLockStats(page)).requests)
      .toBeGreaterThanOrEqual(1)

    await page.evaluate(() => window.__sfu.stop())

    await expect
      .poll(async () => (await wakeLockStats(page)).releases)
      .toBeGreaterThanOrEqual(1)
  })
})
