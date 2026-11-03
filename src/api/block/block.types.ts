/** A durable directed block edge (blocker → blocked). */
export type TBlockEdge = {
  id: string
  blockerId: string
  blockedId: string
  createdAt: string
}

/** A user summary as it appears in the caller's "blocked accounts" list. */
export type TBlockUser = {
  id: string
  name: string
  image?: string | null
  blockedAt?: string | null
}

export type TBlockList = {
  data: TBlockUser[]
  total: number
  limit: number
  offset: number
}

export type BlockTargetDTO = { userId: string }

export type TPaginationParams = { limit?: number; offset?: number }
