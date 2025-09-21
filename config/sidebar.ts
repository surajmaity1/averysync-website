import { HomeIcon, LucideIcon } from 'lucide-react'

export type TSidebarLink = {
  id: string
  title: string
  url: string
  icon: LucideIcon
}

export const SIDEBARS: TSidebarLink[] = [
  {
    id: 'home',
    title: 'home',
    url: '/home',
    icon: HomeIcon,
  },
]