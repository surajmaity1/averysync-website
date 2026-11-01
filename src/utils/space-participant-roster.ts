import type { ParticipantDTO } from '@/api/posts/posts.types'

/**
 * Pure roster helpers shared by the participants hooks and UI. The REST DTO is
 * the source of truth for the UI (docs/03 §4.3 note); these keep the gating and
 * mute reconciliation logic in one testable place.
 */

/** The viewer's own row, or undefined when they are not in the roster. */
export const findOwnParticipant = (
  participants: ParticipantDTO[],
  userId?: string,
): ParticipantDTO | undefined =>
  userId ? participants.find((p) => p.userId === userId) : undefined

/**
 * Whether the viewer may moderate — true only when their OWN row is HOST.
 * Gates the mute/unmute controls (docs/03 §4.3 point 3).
 */
export const viewerIsHost = (
  participants: ParticipantDTO[],
  userId?: string,
): boolean => findOwnParticipant(participants, userId)?.role === 'HOST'

/** Rows still present in the space (defensive for includeLeft history views). */
export const activeParticipants = (
  participants: ParticipantDTO[],
): ParticipantDTO[] => participants.filter((p) => p.leftAt === null)

/**
 * Effective mute per the backend's lazy rule:
 * `isMuted AND (mutedUntil IS NULL OR mutedUntil > now)`.
 * The DTO's `isMuted` is already effective at read time; this lets the client
 * self-expire a temp mute between reads without a round-trip (docs/03 §5.3).
 */
export const isEffectivelyMuted = (
  participant: ParticipantDTO,
  now: Date = new Date(),
): boolean => {
  if (!participant.isMuted) return false
  if (participant.mutedUntil === null) return true
  return new Date(participant.mutedUntil).getTime() > now.getTime()
}
