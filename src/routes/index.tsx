import { HomePage } from '@/modules/home'
import { createFileRoute } from '@tanstack/react-router'

function Index() {
  return <HomePage />
}

export const Route = createFileRoute('/')({
  component: Index,
})
