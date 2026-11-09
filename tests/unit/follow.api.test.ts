import { describe, expect, it, vi, beforeEach } from 'vitest'
import { FollowApi } from '@/api/follow/follow.api'
import { axiosAPIClient } from '@/libs/axios-api-client'
import {
  mockFollowActionAcceptResponse,
  mockFollowEdge,
} from '../fixtures/follow.fixture'

describe('FollowApi.followRequestAction', () => {
  beforeEach(() => {
    vi.restoreAllMocks()
  })

  it('defines followRequestAction with the correct query key', () => {
    expect(FollowApi.followRequestAction.key).toEqual([
      'followApi.followRequestAction',
    ])
  })

  it('sends PATCH /v1/requests/follow/:followerId with action "accept" and returns follow edge data', async () => {
    const patchSpy = vi
      .spyOn(axiosAPIClient, 'patch')
      .mockResolvedValueOnce({ data: mockFollowActionAcceptResponse })

    const result = await FollowApi.followRequestAction.fn({
      followerId: mockFollowEdge.followerId,
      action: 'accept',
    })

    expect(patchSpy).toHaveBeenCalledWith(
      `/v1/requests/follow/${mockFollowEdge.followerId}`,
      { action: 'accept' },
    )
    expect(result).toEqual(mockFollowEdge)
  })

  it('sends PATCH /v1/requests/follow/:followerId with action "reject"', async () => {
    const patchSpy = vi
      .spyOn(axiosAPIClient, 'patch')
      .mockResolvedValueOnce({ data: null, status: 204 })

    const result = await FollowApi.followRequestAction.fn({
      followerId: mockFollowEdge.followerId,
      action: 'reject',
    })

    expect(patchSpy).toHaveBeenCalledWith(
      `/v1/requests/follow/${mockFollowEdge.followerId}`,
      { action: 'reject' },
    )
    expect(result).toBeUndefined()
  })
})
