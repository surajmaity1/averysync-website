import { BrandLogo } from '@/components/ui/brand-logo'
import { ArrowLeft } from 'lucide-react'
import React from 'react'

/**
 * Minimal top bar for the legal pages. Unlike the marketing navbar it has no
 * API-driven CTA, so the legal pages stay self-contained and fast. The logo
 * links back to the home page.
 */
export const LegalHeader: React.FC = () => (
  <header className="sticky top-0 z-40 border-b border-slate-200 bg-white/80 backdrop-blur-xl">
    <div className="mx-auto flex h-16 max-w-[1200px] items-center justify-between px-5 sm:px-6 lg:px-8">
      <a href="/" className="group flex items-center gap-2.5">
        <BrandLogo size={36} label="" className="shadow-sm" />
        <span className="tracking-tightest text-[17px] font-bold text-slate-900">
          Averysync
        </span>
      </a>
      <a
        href="/"
        className="inline-flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium text-slate-600 transition-colors hover:text-slate-900"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to home
      </a>
    </div>
  </header>
)
