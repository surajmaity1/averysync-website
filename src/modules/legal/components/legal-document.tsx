import { Eyebrow } from '@/modules/home/components/ui/eyebrow'
import { CalendarClock } from 'lucide-react'
import React from 'react'
import { formatLegalDate } from '../legal.utils'
import type { LegalBlock, LegalDocument } from '../legal.types'

const Block: React.FC<{ block: LegalBlock }> = ({ block }) => {
  if (block.type === 'list') {
    return (
      <ul className="my-4 space-y-2.5 pl-1">
        {block.items.map((item, i) => (
          <li key={i} className="flex gap-3 text-slate-600">
            <span
              aria-hidden
              className="mt-2.5 h-1.5 w-1.5 shrink-0 rounded-full bg-blue-500"
            />
            <span className="leading-relaxed">{item}</span>
          </li>
        ))}
      </ul>
    )
  }
  return <p className="my-4 leading-relaxed text-slate-600">{block.text}</p>
}

/**
 * Renders a legal document: a title hero with the effective date, a sticky
 * table of contents, and the body sections. Purely presentational so it can be
 * unit-tested without any router or query context.
 */
export const LegalDocumentView: React.FC<{ document: LegalDocument }> = ({
  document,
}) => {
  const effectiveDate = formatLegalDate(document.lastUpdated)

  return (
    <div className="mx-auto max-w-[1200px] px-5 sm:px-6 lg:px-8">
      {/* Hero */}
      <div className="border-b border-slate-200 py-14 sm:py-20">
        <Eyebrow className="text-blue-600">Legal</Eyebrow>
        <h1 className="tracking-tightest mt-4 text-4xl font-bold text-slate-900 sm:text-5xl">
          {document.title}
        </h1>
        {effectiveDate && (
          <p className="mt-5 inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3.5 py-1.5 text-sm font-medium text-slate-500">
            <CalendarClock className="h-4 w-4 text-slate-400" />
            Last updated {effectiveDate}
          </p>
        )}
        <p className="mt-6 max-w-2xl text-lg leading-relaxed text-slate-600">
          {document.intro}
        </p>
      </div>

      {/* Body: sticky TOC + prose */}
      <div className="gap-12 py-12 lg:grid lg:grid-cols-[240px_minmax(0,1fr)]">
        <nav
          aria-label="Table of contents"
          className="mb-10 lg:sticky lg:top-24 lg:mb-0 lg:self-start"
        >
          <Eyebrow className="block text-slate-400">On this page</Eyebrow>
          <ul className="mt-4 space-y-2 border-l border-slate-200 text-sm">
            {document.sections.map((section) => (
              <li key={section.id}>
                <a
                  href={`#${section.id}`}
                  className="-ml-px block border-l-2 border-transparent py-1 pl-4 text-slate-500 transition-colors hover:border-blue-500 hover:text-slate-900"
                >
                  {section.heading}
                </a>
              </li>
            ))}
          </ul>
        </nav>

        <article className="max-w-3xl min-w-0">
          {document.sections.map((section) => (
            <section key={section.id} className="py-6 first:pt-0">
              <h2
                id={section.id}
                className="scroll-mt-24 text-xl font-semibold tracking-tight text-slate-900"
              >
                {section.heading}
              </h2>
              {section.body.map((block, i) => (
                <Block key={i} block={block} />
              ))}
            </section>
          ))}
        </article>
      </div>
    </div>
  )
}
