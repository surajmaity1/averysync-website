import React from 'react'
import { LegalPageLayout } from './components/legal-page-layout'
import { TERMS_DOCUMENT } from './legal.data'

export const TermsPage: React.FC = () => (
  <LegalPageLayout
    document={TERMS_DOCUMENT}
    sibling={{ label: 'Privacy Policy', href: '/privacy' }}
  />
)
