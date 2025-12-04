import { CheckCircle2, Code2, Share2, Terminal } from 'lucide-react'
import React from 'react'

/* --- Interfaces --- */

export interface NavLink {
  label: string
  href: string
}

export interface Feature {
  title: string
  description: string
  icon: React.ReactNode
}

export interface Testimonial {
  content: string
  author: string
  role: string
  avatar: string
}

export interface Stat {
  label: string
  value: string
}

/* --- Constants --- */

export const NAV_LINKS: NavLink[] = [
  { label: 'Community', href: '#community' },
  { label: 'Explore Issues', href: '#explore' },
  { label: 'Discussions', href: '#discussions' },
  { label: 'Enterprise', href: '#enterprise' },
]

// Note: In a real app, you might pass the Icon component class instead of the rendered node
// but we will keep your structure for consistency.
export const FEATURES: Feature[] = [
  {
    title: 'Live Debugging Rooms',
    description:
      'Share your terminal and IDE context in real-time with peers to squash bugs faster than ever.',
    icon: <Terminal className="h-6 w-6 text-blue-600" />,
  },
  {
    title: 'Community Feed',
    description:
      'A tailored social feed focusing on technical achievements, open source contributions, and knowledge sharing.',
    icon: <Share2 className="h-6 w-6 text-blue-600" />,
  },
  {
    title: 'Verified Solutions',
    description:
      'Our reputation system ensures the best technical answers rise to the top. No more digging through outdated threads.',
    icon: <CheckCircle2 className="h-6 w-6 text-blue-600" />,
  },
  {
    title: 'Code-Aware Search',
    description:
      'Search by error logs, stack traces, or code snippets to find exact matches across the global knowledge base.',
    icon: <Code2 className="h-6 w-6 text-blue-600" />,
  },
]

export const TESTIMONIALS: Testimonial[] = [
  {
    content:
      'I posted a complex race condition issue in the React channel and had three senior engineers helping me debug within minutes.',
    author: 'Alex Rivera',
    role: 'Frontend Lead',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Alex',
  },
  {
    content:
      "Finally, a social network that understands code. I've met my last two co-founders through the architecture discussion forums.",
    author: 'Sarah Chen',
    role: 'System Architect',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Sarah',
  },
  {
    content:
      "The balance between social interaction and serious technical problem solving is perfect. It's my go-to tab.",
    author: 'James Wilson',
    role: 'Full Stack Developer',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=James',
  },
]

export const STATS: Stat[] = [
  { label: 'Developers', value: '1+' },
  { label: 'Issues Solved', value: '0' },
  { label: 'Daily Snippets', value: '0' },
]
