import { isAxiosError } from 'axios'

/**
 * Semantic outcome of a failed participants call. The doc is explicit: branch
 * on the HTTP status code, never on message text (the `errors` field is a list
 * of {title, description} in dev/staging but a plain string in prod).
 * See docs/03-space-participants-integration-guide.md §2.3 and §4.3(5).
 */
export type ParticipantErrorCode =
  | 'INVALID_INPUT' // 400 — bad UUID / invalid body / self-mute
  | 'UNAUTHENTICATED' // 401 — no/expired cookie JWT
  | 'FORBIDDEN' // 403 — caller is not HOST
  | 'NOT_FOUND' // 404 — space or participant gone
  | 'NOT_LIVE' // 409 — space still SCHEDULED
  | 'ENDED' // 410 — space ENDED / CLOSED
  | 'SERVER_ERROR' // 500 — unexpected
  | 'UNKNOWN' // non-axios error, or an unmapped status

export type ParticipantError = {
  /** HTTP status, or 0 when the failure never reached the server. */
  status: number
  code: ParticipantErrorCode
  /** User-facing text: the server `message` when present, else a friendly default. */
  message: string
}

const STATUS_CODE: Record<number, ParticipantErrorCode> = {
  400: 'INVALID_INPUT',
  401: 'UNAUTHENTICATED',
  403: 'FORBIDDEN',
  404: 'NOT_FOUND',
  409: 'NOT_LIVE',
  410: 'ENDED',
  500: 'SERVER_ERROR',
}

// Friendly fallbacks used only when the backend omits a `message`.
const FALLBACK_MESSAGE: Record<ParticipantErrorCode, string> = {
  INVALID_INPUT: 'That request was invalid. Please try again.',
  UNAUTHENTICATED: 'Please sign in to continue.',
  FORBIDDEN: 'Only the host can do that.',
  NOT_FOUND: 'This space or participant is no longer available.',
  NOT_LIVE: "This space hasn't started yet.",
  ENDED: 'This space has ended.',
  SERVER_ERROR: 'Something went wrong. Please try again.',
  UNKNOWN: 'Something went wrong. Please try again.',
}

/**
 * Normalises any thrown value from a participants call into a
 * status-code-driven `ParticipantError`. Callers switch on `.code` for flow
 * decisions and show `.message` to the user.
 */
export const mapParticipantError = (error: unknown): ParticipantError => {
  if (isAxiosError(error) && error.response) {
    const status = error.response.status
    const code = STATUS_CODE[status] ?? 'UNKNOWN'

    // Only trust a string `message`; the envelope's `errors` may be a list.
    const raw = (error.response.data as { message?: unknown } | undefined)
      ?.message
    const message =
      typeof raw === 'string' && raw ? raw : FALLBACK_MESSAGE[code]

    return { status, code, message }
  }

  return { status: 0, code: 'UNKNOWN', message: FALLBACK_MESSAGE.UNKNOWN }
}
