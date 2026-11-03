import { Footer } from '@/modules/home/components/layout/footer'
import { ArrowRight } from 'lucide-react'
import React from 'react'
import type { LegalDocument } from '../legal.types'
import { LegalDocumentView } from './legal-document'
import { LegalHeader } from './legal-header'

interface SiblingLink {
  label: string
  href: string
}

/**
 * Full-page shell shared by the Terms and Privacy pages: legal header, the
 * rendered document, a cross-link to the sibling policy, and the marketing
 * footer for a consistent look with the rest of the site.
 */
export const LegalPageLayout: React.FC<{
  document: LegalDocument
  sibling: SiblingLink
}> = ({ document, sibling }) => (
  <div className="min-h-screen bg-slate-50 font-sans text-slate-900">
    <LegalHeader />
    <main>
      <LegalDocumentView document={document} />

      <div className="mx-auto max-w-[1200px] px-5 pb-16 sm:px-6 lg:px-8">
        <a
          href={sibling.href}
          className="group flex items-center justify-between rounded-2xl border border-slate-200 bg-white px-6 py-5 transition-colors hover:border-blue-300"
        >
          <span>
            <span className="block text-xs font-medium tracking-wide text-slate-400 uppercase">
              Read next
            </span>
            <span className="mt-0.5 block text-base font-semibold text-slate-900">
              {sibling.label}
            </span>
          </span>
          <ArrowRight className="h-5 w-5 text-slate-400 transition-transform group-hover:translate-x-0.5 group-hover:text-blue-600" />
        </a>
      </div>
    </main>
    <Footer />
  </div>
)
