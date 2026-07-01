// Test harness — boots a single SpaceStreamManager instance and exposes a
// controllable, observable API on window.__sfu so Playwright tests can drive
// it without rendering the React tree.

import {
  SpaceStreamManager,
  type ConnectionStatus,
  type ManagerOptions,
  type TokenProvider,
} from '../../../src/utils/stream'

interface StartOptions {
  tokens?: string[]
  managerOptions?: ManagerOptions
}

export interface HarnessAPI {
  start: (wsUrl: string, opts?: StartOptions) => Promise<void>
  stop: () => void
  toggleMute: (muted: boolean) => void
  sendEndSpace: () => void
  getStatus: () => ConnectionStatus
  getStatusLog: () => ConnectionStatus[]
  getPeerJoinedLog: () => string[]
  getPeerLeftLog: () => string[]
  getEndedMessage: () => string | null
  getAudioCount: () => number
  getTokenCalls: () => number
  getReceivedTracks: () => number
  getMicEnabled: () => boolean | null
  reset: () => void
}

declare global {
  interface Window {
    __sfu: HarnessAPI
  }
}

const container = document.getElementById('audio-container') as HTMLDivElement

let manager: SpaceStreamManager | null = null
let status: ConnectionStatus = 'idle'
let statusLog: ConnectionStatus[] = []
let peerJoinedLog: string[] = []
let peerLeftLog: string[] = []
let endedMessage: string | null = null
let tokenCalls = 0
let receivedTracks = 0

function fullReset(): void {
  manager?.stop()
  manager = null
  status = 'idle'
  statusLog = []
  peerJoinedLog = []
  peerLeftLog = []
  endedMessage = null
  tokenCalls = 0
  receivedTracks = 0
  container.innerHTML = ''
}

window.__sfu = {
  async start(wsUrl, opts = {}) {
    fullReset()

    const tokens = opts.tokens ?? ['test-token']
    let i = 0
    const tokenProvider: TokenProvider = () => {
      tokenCalls += 1
      return tokens[Math.min(i++, tokens.length - 1)]
    }

    manager = new SpaceStreamManager(
      {
        onStatusChange: (s) => {
          status = s
          statusLog.push(s)
        },
        onTrackReceived: () => {
          receivedTracks += 1
        },
        onSpaceEnded: (msg) => {
          endedMessage = msg
        },
        onPeerJoined: (pid) => peerJoinedLog.push(pid),
        onPeerLeft: (pid) => peerLeftLog.push(pid),
      },
      opts.managerOptions,
    )
    manager.setAudioContainer(container)

    await manager.start(tokenProvider, wsUrl)
  },
  stop: () => manager?.stop(),
  toggleMute: (muted) => manager?.toggleMute(muted),
  sendEndSpace: () => manager?.sendEndSpace(),
  getStatus: () => status,
  getStatusLog: () => [...statusLog],
  getPeerJoinedLog: () => [...peerJoinedLog],
  getPeerLeftLog: () => [...peerLeftLog],
  getEndedMessage: () => endedMessage,
  getAudioCount: () => container.querySelectorAll('audio').length,
  getTokenCalls: () => tokenCalls,
  getReceivedTracks: () => receivedTracks,
  getMicEnabled: () => manager?.getMicEnabled() ?? null,
  reset: fullReset,
}
