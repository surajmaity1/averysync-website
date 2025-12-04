import React from 'react'
import { TESTIMONIALS } from '../data/data'
import { SectionLabel } from '../ui/sectionLabel'

export const Testimonials: React.FC = () => {
  return (
    <section id="testimonials" className="bg-white py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-16 text-center">
          <SectionLabel>Community Love</SectionLabel>
          <h2 className="text-3xl font-bold text-slate-900">
            Devs helping devs
          </h2>
        </div>
        <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
          {TESTIMONIALS.map((t, i) => (
            <div
              key={i}
              className="relative rounded-2xl border border-slate-100 bg-slate-50 p-8"
            >
              <div className="absolute -top-4 -left-2 font-serif text-6xl text-blue-100">
                "
              </div>
              <p className="relative z-10 mb-8 text-slate-700 italic">
                {t.content}
              </p>
              <div className="flex items-center gap-4">
                <img
                  src={t.avatar}
                  alt={t.author}
                  className="h-10 w-10 rounded-full bg-slate-200"
                />
                <div>
                  <h4 className="text-sm font-bold text-slate-900">
                    {t.author}
                  </h4>
                  <p className="text-xs text-slate-500">{t.role}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
