import { LucideIcon } from 'lucide-react'

export interface NavLink {
  label: string
  href: string
}

export interface Feature {
  title: string
  description: string
  icon: LucideIcon
}

export interface Stat {
  label: string
  value: string
}

export interface Testimonial {
  content: string
  author: string
  role: string
  avatar: string
}
