import { createFileRoute } from '@tanstack/react-router'
import { lazy } from 'react'

const PrivacyPage = lazy(() =>
  import('@/modules/legal').then((m) => ({ default: m.PrivacyPage })),
)

export const Route = createFileRoute('/privacy')({
  component: PrivacyPage,
})
