/**
 * Formats an ISO date (YYYY-MM-DD) as a long, human-readable US date, e.g.
 * "July 20, 2026". Rendered in UTC so the output never shifts with the
 * viewer's timezone (a date-only value has no meaningful local time).
 */
export const formatLegalDate = (iso: string): string => {
  const date = new Date(iso)
  if (Number.isNaN(date.getTime())) return ''

  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    timeZone: 'UTC',
  }).format(date)
}
