import { createFileRoute } from '@tanstack/react-router'

function About() {
  return <p>About Page</p>
}

export const Route = createFileRoute('/about')({
  component: About,
})
