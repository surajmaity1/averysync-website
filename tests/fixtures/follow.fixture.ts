import { TApiResponse } from '@/api/common/common.type'
import { TFollowEdge } from '@/api/follow/follow.types'

export const mockFollowEdge: TFollowEdge = {
  id: 'edge-1',
  followerId: 'user-1',
  followeeId: 'user-2',
  status: 'ACCEPTED',
  requestedAt: '2026-11-09T00:00:00.000Z',
  respondedAt: '2026-11-09T00:01:00.000Z',
  createdAt: '2026-11-09T00:00:00.000Z',
}

export const mockFollowActionAcceptResponse: TApiResponse<TFollowEdge> = {
  data: mockFollowEdge,
  message: 'Accepted',
}
