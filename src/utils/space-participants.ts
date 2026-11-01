export type SpaceParticipant = {
  userId: string
  isHost: boolean
  isSelf: boolean
}

type BuildParticipantListArgs = {
  hostId: string
  /** Live host presence — a disconnected host must not linger in the list. */
  hostPresent: boolean
  currentUserId?: string
  /** Peer ids from peer_joined/peer_left broadcasts; may repeat or include
   * the host/viewer, so entries are deduplicated here. */
  peerIds: string[]
}

/**
 * The ordered participant list for a space: host first (while present), then
 * the viewer, then everyone else — each id appearing exactly once.
 */
export const buildParticipantList = ({
  hostId,
  hostPresent,
  currentUserId,
  peerIds,
}: BuildParticipantListArgs): SpaceParticipant[] => {
  const viewerIsHost = currentUserId === hostId

  const participants: SpaceParticipant[] = hostPresent
    ? [{ userId: hostId, isHost: true, isSelf: viewerIsHost }]
    : []

  if (currentUserId && !viewerIsHost) {
    participants.push({ userId: currentUserId, isHost: false, isSelf: true })
  }

  const seen = new Set(participants.map((p) => p.userId))
  // A disconnected host must not re-enter via the peer list either.
  seen.add(hostId)

  for (const peerId of peerIds) {
    if (seen.has(peerId)) continue
    seen.add(peerId)
    participants.push({ userId: peerId, isHost: false, isSelf: false })
  }

  return participants
}
