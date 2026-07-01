import type { Page, WebSocketRoute } from '@playwright/test'

// The wire protocol the Go SFU server speaks. Kept local to the test layer so
// changes to the production type alias don't silently break expectations here —
// if the server protocol moves, both sides must move together.
export type SfuMsgType =
  | 'offer'
  | 'answer'
  | 'ice_candidate'
  | 'end_space'
  | 'space_ended'
  | 'peer_joined'
  | 'peer_left'
  | 'error'

export interface SfuSignal {
  type: SfuMsgType
  sdp?: string
  candidate?: RTCIceCandidateInit
  peer_id?: string
  message?: string
}

export interface SfuMock {
  /** WebSocket URL the harness should connect to. */
  readonly url: string
  /** Every signal the client has sent us, in order. */
  readonly received: SfuSignal[]
  /** Every WS session the client has opened (including reconnects). */
  readonly sockets: WebSocketRoute[]
  /** Decide whether the mock auto-answers the initial offer. */
  setAutoAnswer(enabled: boolean): void
  /** Push a signal to the most recently opened session. */
  push(signal: SfuSignal): void
  /** Force the most recently opened session to close — simulates a drop. */
  dropLast(code?: number, reason?: string): void
  /** Reset received signals; useful between phases of one test. */
  clearReceived(): void
  /**
   * When enabled, every new connection is closed immediately. Lets the
   * max-attempts test exercise the failure path in milliseconds instead of
   * waiting for full reconnect/backoff round-trips.
   */
  setDropOnConnect(enabled: boolean): void
}

/**
 * Convert an offer SDP into something acceptable as an answer.
 * The peer connection won't actually go to "connected" since there's no real
 * remote ICE/DTLS, but setRemoteDescription will succeed — that's enough to
 * exercise the manager's signaling state machine.
 */
export function offerSdpToAnswer(offerSdp: string): string {
  return offerSdp.replace(/a=setup:actpass/g, 'a=setup:passive')
}

/**
 * Mock the SFU at a fixed URL using Playwright's WebSocket routing. Each test
 * gets its own isolated mock — no shared port, no cross-test leakage.
 */
export async function installSfuMock(
  page: Page,
  url = 'ws://sfu.test.local/ws',
): Promise<SfuMock> {
  const received: SfuSignal[] = []
  const sockets: WebSocketRoute[] = []
  let autoAnswer = true
  let dropOnConnect = false

  // The route matcher uses just the host+path; the production code appends
  // ?token=... which we want to match too.
  await page.routeWebSocket(/sfu\.test\.local\/ws/, (ws) => {
    sockets.push(ws)

    if (dropOnConnect) {
      ws.close({ code: 1006, reason: 'auto-drop' })
      return
    }

    ws.onMessage((message) => {
      const raw = typeof message === 'string' ? message : message.toString()
      let signal: SfuSignal
      try {
        signal = JSON.parse(raw) as SfuSignal
      } catch {
        return
      }
      received.push(signal)

      if (signal.type === 'offer' && autoAnswer && signal.sdp) {
        ws.send(
          JSON.stringify({
            type: 'answer',
            sdp: offerSdpToAnswer(signal.sdp),
          } satisfies SfuSignal),
        )
      }
    })
  })

  return {
    url,
    received,
    sockets,
    setAutoAnswer(enabled) {
      autoAnswer = enabled
    },
    push(signal) {
      const last = sockets[sockets.length - 1]
      if (!last)
        throw new Error('SfuMock.push called before any client connected')
      last.send(JSON.stringify(signal))
    },
    dropLast(code = 1006, reason = 'test-drop') {
      const last = sockets[sockets.length - 1]
      if (!last)
        throw new Error('SfuMock.dropLast called before any client connected')
      last.close({ code, reason })
    },
    clearReceived() {
      received.length = 0
    },
    setDropOnConnect(enabled) {
      dropOnConnect = enabled
    },
  }
}
