import type { AvatarColor } from '../ui/initials-avatar'

/* --- Types --- */

export interface NavLink {
  label: string
  href: string
}

export interface HeroAvatar {
  initials: string
  color: AvatarColor
}

export interface Stat {
  value: number
  decimals?: number
  suffix?: string
  label: string
  /** Renders a pulsing dot instead of a suffix (for the "live now" stat). */
  live?: boolean
}

export interface SpaceHost {
  name: string
  role: string
  initials: string
  color: AvatarColor
}

export type Space =
  | {
      status: 'live'
      title: string
      tags: string[]
      elapsed: string
      host: SpaceHost
      listeners: number
    }
  | {
      status: 'upcoming'
      title: string
      tags: string[]
      startsIn: string
      schedule: string
      host: SpaceHost
    }

export interface Step {
  title: string
  description: string
}

export interface Testimonial {
  content: string
  author: string
  role: string
  initials: string
  color: AvatarColor
}

/* --- Shared avatar palette --- */

export const AVATAR_COLORS = {
  blue: { bg: '#dbeafe', fg: '#1d4ed8' },
  indigo: { bg: '#e0e7ff', fg: '#4338ca' },
  slate: { bg: '#e2e8f0', fg: '#334155' },
  teal: { bg: '#ccfbf1', fg: '#0f766e' },
  amber: { bg: '#fef3c7', fg: '#b45309' },
  dark: { bg: '#0f172a', fg: '#ffffff' },
} satisfies Record<string, AvatarColor>

/* --- Content --- */

export const NAV_LINKS: NavLink[] = [
  { label: 'Live Spaces', href: '#spaces' },
  { label: 'Product', href: '#product' },
  { label: 'Features', href: '#features' },
  { label: 'Community', href: '#community' },
]

export const HERO_AVATARS: HeroAvatar[] = [
  { initials: 'MP', color: AVATAR_COLORS.blue },
  { initials: 'DS', color: AVATAR_COLORS.indigo },
  { initials: 'PS', color: AVATAR_COLORS.slate },
  { initials: 'JW', color: AVATAR_COLORS.teal },
  { initials: '+', color: AVATAR_COLORS.dark },
]

export const STATS: Stat[] = [
  { value: 10400, suffix: '+', label: 'Engineers' },
  { value: 3400, suffix: '+', label: 'Spaces hosted' },
  { value: 1.9, decimals: 1, suffix: 'M', label: 'Minutes spoken' },
  { value: 47, label: 'Live right now', live: true },
]

export const SPACES: Space[] = [
  {
    status: 'live',
    title: 'Rust vs Go for infra tooling',
    tags: ['#rust', '#devtools'],
    elapsed: '18:42',
    host: {
      name: 'Diego Santos',
      role: 'Developer Advocate',
      initials: 'DS',
      color: AVATAR_COLORS.indigo,
    },
    listeners: 128,
  },
  {
    status: 'live',
    title: 'Debugging distributed systems, live',
    tags: ['#distributed', '#observability'],
    elapsed: '41:07',
    host: {
      name: 'Felix Kern',
      role: 'Staff Engineer',
      initials: 'FK',
      color: AVATAR_COLORS.blue,
    },
    listeners: 76,
  },
  {
    status: 'upcoming',
    title: 'Design systems that actually scale',
    tags: ['#design-systems', '#frontend'],
    startsIn: 'Starts in 20m',
    schedule: 'Today · 4:30 PM',
    host: {
      name: 'Priya Sharma',
      role: 'Design Engineer',
      initials: 'PS',
      color: AVATAR_COLORS.slate,
    },
  },
]

export const STEPS: Step[] = [
  {
    title: 'Find your room',
    description:
      'Browse live Spaces by topic and stack, or spin up your own room in seconds. No calendar invites, no waiting.',
  },
  {
    title: 'Jump in and talk',
    description:
      'Listen in, or raise a hand to join the stage. Real voices, real nuance — the stuff that never fits in a thread.',
  },
  {
    title: 'Grow your signal',
    description:
      'Every sharp answer builds your reputation and your network. Turn a hallway chat into your next role.',
  },
]

export const FEATURED_TESTIMONIAL: Testimonial = {
  content:
    'I hosted a Space about scaling backends and ended up talking to a VP of Engineering for an hour. Two weeks later we met in person. The format is a genuine game changer.',
  author: 'Alex Rivera',
  role: 'Backend Lead',
  initials: 'AR',
  color: { bg: '#1d4ed8', fg: '#ffffff' },
}

export const STARRED_TESTIMONIAL: Testimonial = {
  content:
    'Finally, a professional network that feels human. I scout talent by listening to how people explain hard concepts in real time.',
  author: 'Sarah Chen',
  role: 'Product Director',
  initials: 'SC',
  color: AVATAR_COLORS.slate,
}

export const TESTIMONIALS: Testimonial[] = [
  {
    content:
      "It's like a 24/7 tech conference. I jump in, listen to senior engineers debate trends, and ask questions directly. It accelerated my growth more than any course.",
    author: 'James Wilson',
    role: 'UI/UX Designer',
    initials: 'JW',
    color: AVATAR_COLORS.teal,
  },
  {
    content:
      'Our whole platform team does incident retros here now. Talking through a postmortem out loud beats a 40-comment thread every single time.',
    author: 'Maya Patel',
    role: 'Systems Engineer',
    initials: 'MP',
    color: AVATAR_COLORS.blue,
  },
  {
    content:
      'I shipped a gnarly migration on the strength of one Space. The reputation system means the sharpest people are easy to find.',
    author: 'Diego Santos',
    role: 'Developer Advocate',
    initials: 'DS',
    color: AVATAR_COLORS.indigo,
  },
]

export const FOOTER_LINKS: { heading: string; links: NavLink[] }[] = [
  {
    heading: 'Product',
    links: [
      { label: 'Features', href: '#features' },
      { label: 'Live Spaces', href: '#spaces' },
      { label: 'The Feed', href: '#product' },
      { label: 'Changelog', href: '#' },
    ],
  },
  {
    heading: 'Company',
    links: [
      { label: 'About', href: '#' },
      { label: 'Careers', href: '#' },
      { label: 'Community', href: '#community' },
      { label: 'Contact', href: '#' },
    ],
  },
]
