import React from 'react'
import { LegalPageLayout } from './components/legal-page-layout'
import { PRIVACY_DOCUMENT } from './legal.data'

export const PrivacyPage: React.FC = () => (
  <LegalPageLayout
    document={PRIVACY_DOCUMENT}
    sibling={{ label: 'Terms of Service', href: '/terms' }}
  />
)
