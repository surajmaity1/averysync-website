import { createFileRoute } from '@tanstack/react-router'
import { lazy } from 'react'

const TermsPage = lazy(() =>
  import('@/modules/legal').then((m) => ({ default: m.TermsPage })),
)

export const Route = createFileRoute('/terms')({
  component: TermsPage,
})
