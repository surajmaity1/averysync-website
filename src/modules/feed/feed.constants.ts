/**
 * Presentational sample content for feed rails that have no backend yet.
 *
 * The product API today exposes only posts and users. The design system's feed
 * kit also specifies "Your frequencies" (topic chips), "Who to follow", and
 * "Trending topics" rails. There are no endpoints behind these, so rather than
 * fabricate API calls we render them from this clearly-labelled static module
 * (mirroring the design kit's own `data.js`).
 *
 * ⚠️ Replace each constant with a real query once the corresponding endpoint
 * ships. Nothing here is user-specific or persisted.
 */

/** Topic chips for the left-rail "Your frequencies" card. */
export const SAMPLE_TOPICS = [
  'design-systems',
  'backend',
  'rust',
  'devtools',
  'open-source',
] as const

/** People suggestions for the right-rail "Who to follow" card. */
export const SAMPLE_SUGGESTIONS = [
  { name: 'Maya Patel', role: 'Systems Engineer' },
  { name: 'Diego Santos', role: 'Developer Advocate' },
  { name: 'Priya Sharma', role: 'Design Engineer' },
] as const

/** Topics for the right-rail "Trending topics" card. */
export const SAMPLE_TRENDING = [
  { tag: 'design-systems', posts: '1.2k' },
  { tag: 'rust', posts: '860' },
  { tag: 'postgres', posts: '540' },
  { tag: 'devtools', posts: '470' },
  { tag: 'webgpu', posts: '310' },
] as const
