// types/post.ts

export enum SpaceStatus {
  draft = 1,
  scheduled = 2,
  live = 3,
  ended = 4,
  cancelled = 5,
}

export interface Post {
  id: string
  title: string
  description: string
  status: SpaceStatus
  createdBy: string
  createdAt: string
  updatedAt: string
  type: PostType
  // ... other fields
}

export enum PostType {
  TEXT = 'TEXT',
  SPACE = 'SPACE',
  // ... other types
}

// API Response types
export interface UpdatePostResponse {
  data: Post
  token?: string // JWT token for WebRTC connection
  websocket_url?: string // WebSocket URL for Golang server
}

export interface SpaceConnectionConfig {
  token: string
  websocket_url: string
}

// WebRTC Connection States
export type RTCConnectionState =
  | 'new'
  | 'connecting'
  | 'connected'
  | 'disconnected'
  | 'failed'
  | 'closed'

export type RTCIceConnectionState =
  | 'new'
  | 'checking'
  | 'connected'
  | 'completed'
  | 'failed'
  | 'disconnected'
  | 'closed'

export type RTCSignalingState =
  | 'stable'
  | 'have-local-offer'
  | 'have-remote-offer'
  | 'have-local-pranswer'
  | 'have-remote-pranswer'
  | 'closed'

// WebSocket Message Types
export interface WebSocketMessage {
  type: 'offer' | 'answer' | 'candidate' | 'negotiate' | 'error'
  sdp?: string
  candidate?: RTCIceCandidateInit
  error?: string
}

export interface SpaceParticipant {
  userId: string
  username: string
  isSpeaker: boolean
  isMuted: boolean
  joinedAt: string
}

export interface SpaceStats {
  participantCount: number
  speakerCount: number
  listenerCount: number
  duration: number
}
