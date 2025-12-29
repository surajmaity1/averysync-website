import { ArrowUpRight } from 'lucide-react'
import React from 'react'
import { FEATURES } from '../data/data'
import { SectionLabel } from '../ui/sectionLabel'

export const Features: React.FC = () => {
  return (
    <section id="features" className="bg-slate-50 py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-16 flex flex-col items-start justify-between gap-6 md:flex-row md:items-end">
          <div className="max-w-2xl">
            <SectionLabel>Capabilities</SectionLabel>
            <h2 className="mt-4 text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
              Everything you need to <span className="text-blue-600">sync</span>{' '}
              better.
            </h2>
            <p className="mt-4 text-lg leading-relaxed text-slate-600">
              Built for the modern engineering stack. We've reimagined how
              technical teams communicate, moving beyond text to high-fidelity
              audio spaces.
            </p>
          </div>
          <a
            href="#explore"
            className="group flex items-center gap-2 rounded-full border border-slate-200 bg-white px-5 py-2.5 text-sm font-semibold text-slate-700 transition-all hover:border-blue-200 hover:bg-blue-50 hover:text-blue-700"
          >
            View all features
            <ArrowUpRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
          </a>
        </div>

        {/* Bento Grid */}
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3 lg:gap-8">
          {FEATURES.map((feature, i) => (
            <div
              key={i}
              className={`group relative flex flex-col justify-between overflow-hidden rounded-[2rem] border border-slate-200 bg-white p-8 shadow-sm transition-all duration-300 hover:shadow-xl hover:shadow-slate-200/60 ${
                i === 0 || i === 3 ? 'lg:col-span-2' : 'lg:col-span-1'
              }`}
            >
              {/* Background Gradient Blob */}
              <div className="absolute -top-12 -right-12 h-64 w-64 rounded-full bg-blue-50/50 blur-3xl transition-all duration-500 group-hover:bg-blue-100/60" />

              <div className="relative z-10">
                <div className="mb-6 inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-50 ring-1 ring-slate-100 transition-all duration-300 group-hover:scale-105 group-hover:bg-blue-50 group-hover:ring-blue-100">
                  {feature.icon}
                </div>

                <h3 className="mb-3 text-xl font-bold text-slate-900">
                  {feature.title}
                </h3>
                <p className="text-base leading-relaxed text-slate-600">
                  {feature.description}
                </p>
              </div>

              {/* Decorative Elements for larger cards */}
              {(i === 0 || i === 3) && (
                <div className="relative mt-8 hidden h-24 w-full overflow-hidden rounded-xl border border-slate-100 bg-slate-50/50 p-4 lg:block">
                  <div className="absolute inset-0 bg-[radial-gradient(#cbd5e1_1px,transparent_1px)] [background-size:16px_16px] opacity-30"></div>
                  <div className="flex items-center gap-3 opacity-60">
                    <div className="h-2 w-1/3 rounded-full bg-slate-200"></div>
                    <div className="h-2 w-1/4 rounded-full bg-blue-200"></div>
                  </div>
                  <div className="mt-3 flex items-center gap-3 opacity-40">
                    <div className="h-2 w-1/2 rounded-full bg-slate-200"></div>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
