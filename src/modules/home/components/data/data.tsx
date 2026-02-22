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
    title: 'Live Spaces',
    description:
      'Host or join real-time audio rooms. Discuss design systems, engineering challenges, or product strategy with peers worldwide—just like a hallway track at a conference.',
    icon: <Terminal className="h-6 w-6 text-blue-600" />,
  },
  {
    title: 'Community Feed',
    description:
      'A tailored social feed focusing on technical discussions, open source contributions, and knowledge sharing.',
    icon: <Share2 className="h-6 w-6 text-blue-600" />,
  },
  {
    title: 'Verified Solutions',
    description:
      'Our reputation system ensures the best technical answers rise to the top. No more digging through outdated threads.',
    icon: <CheckCircle2 className="h-6 w-6 text-blue-600" />,
  },
  {
    title: 'Global "Town Hall"',
    description:
      'A tailored feed of live discussions happening right now. From Silicon Valley to Singapore, jump into conversations that matter to your specific niche.',
    icon: <Code2 className="h-6 w-6 text-blue-600" />,
  },
]

export const TESTIMONIALS: Testimonial[] = [
  {
    content:
      "I hosted a space about 'Scaling Backend' and ended up chatting with a VP of Engineering for an hour. Two weeks later, I met in person. The space format is a game changer.",
    author: 'Alex Rivera',
    role: 'Backend Lead',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Alex',
  },
  {
    content:
      'Finally, a professional network that feels human. I use Averysync to scout talent by listening to how developers explain complex concepts in real-time.',
    author: 'Sarah Chen',
    role: 'Product Director',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Sarah',
  },
  {
    content:
      "It's like a 24/7 tech conference. I can jump in, listen to senior designers discuss trends, and ask questions directly. It accelerated my growth more than any course.",
    author: 'James Wilson',
    role: 'UI/UX Designer',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=James',
  },
]

export const STATS: Stat[] = [
  { label: 'Live Spaces Hosted', value: '0' },
  { label: 'Global Professionals', value: '0' },
  { label: 'Minutes Spoken', value: '0' },
]
