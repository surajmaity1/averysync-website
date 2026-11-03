import { axiosAPIClient } from '@/libs/axios-api-client'
import { TApiResponse } from '../common/common.type'
import {
  BlockTargetDTO,
  TBlockEdge,
  TBlockList,
  TPaginationParams,
} from './block.types'

const paginationParams = ({ limit, offset }: TPaginationParams) => ({
  ...(limit !== undefined && { limit }),
  ...(offset !== undefined && { offset }),
})

/**
 * Block-graph endpoints (`docs/04-follow-and-profile-privacy.md`, §7.7).
 * Blocking severs both-direction follow edges and hides the two parties from
 * each other — so a blocked profile GET returns 404 and the only unblock
 * surface is the caller's own blocks list. Block / unblock are idempotent on
 * the backend (200 on repeats), so retries of a settled mutation are safe.
 */
export const BlockApi = {
  block: {
    key: ['blockApi.block'],
    fn: async ({ userId }: BlockTargetDTO): Promise<TBlockEdge> => {
      const { data } = await axiosAPIClient.post<TApiResponse<TBlockEdge>>(
        `/v1/users/${userId}/block`,
        {},
      )

      return data.data
    },
  },
  unblock: {
    key: ['blockApi.unblock'],
    fn: async ({ userId }: BlockTargetDTO): Promise<void> => {
      await axiosAPIClient.delete(`/v1/users/${userId}/block`)
    },
  },
  /** The caller's own active blocks. */
  listBlocks: {
    key: ['blockApi.listBlocks'],
    fn: async (pagination: TPaginationParams = {}): Promise<TBlockList> => {
      const { data } = await axiosAPIClient.get<TBlockList>('/v1/blocks', {
        params: paginationParams(pagination),
      })

      return data
    },
  },
}
