import { LucideIcon, MessageCircle } from 'lucide-react'

export type TSidebarLink = {
  id: string
  title: string
  url: string
  icon: LucideIcon
}

export const SIDEBARS: TSidebarLink[] = [
  {
    id: 'chats',
    title: 'Chat',
    url: '/chats',
    icon: MessageCircle,
  },
]
