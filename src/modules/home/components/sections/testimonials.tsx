import { MessageCircle, Quote, Star } from 'lucide-react'
import React from 'react'
import { TESTIMONIALS } from '../data/data'
import { SectionLabel } from '../ui/sectionLabel'

export const Testimonials: React.FC = () => {
  return (
    <section
      id="testimonials"
      className="relative overflow-hidden bg-white py-24"
    >
      {/* Background Decor */}
      <div className="pointer-events-none absolute top-0 left-1/2 h-full w-full max-w-7xl -translate-x-1/2 opacity-40">
        <div className="absolute top-20 left-20 h-72 w-72 rounded-full bg-blue-100 mix-blend-multiply blur-3xl filter"></div>
        <div className="absolute top-20 right-20 h-72 w-72 rounded-full bg-indigo-100 mix-blend-multiply blur-3xl filter"></div>
      </div>

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-20 flex flex-col items-start justify-between gap-8 md:flex-row md:items-end">
          <div className="max-w-3xl">
            <SectionLabel>Community Stories</SectionLabel>
            <h2 className="mt-4 text-4xl font-bold tracking-tight text-slate-900 sm:text-5xl">
              Loved by <span className="text-blue-600">builders</span>{' '}
              worldwide.
            </h2>
            <p className="mt-6 text-xl leading-relaxed text-slate-600">
              Join thousands of engineers discussing architecture, career, and
              code. See what the community is saying about their experience.
            </p>
          </div>

          <div className="flex-shrink-0">
            <a
              href="http://discord.gg/ZhbqDN9fz4"
              target="_blank"
              rel="noopener noreferrer"
              className="group inline-flex items-center gap-2.5 rounded-full bg-slate-900 px-6 py-3.5 text-sm font-bold text-white shadow-lg shadow-slate-900/20 transition-all hover:scale-105 hover:bg-slate-800 hover:shadow-xl"
            >
              <MessageCircle className="h-5 w-5" />
              Join Discord
            </a>
          </div>
        </div>

        {/* Grid */}
        <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
          {TESTIMONIALS.map((t, i) => (
            <div
              key={i}
              className="group relative flex flex-col justify-between rounded-[2rem] border border-slate-100 bg-white p-8 shadow-sm transition-all duration-500 hover:-translate-y-2 hover:shadow-2xl hover:shadow-slate-200/50"
            >
              {/* Decorative Quote Mark */}
              <div className="absolute top-8 right-8 opacity-10 transition-opacity group-hover:opacity-20">
                <Quote className="h-12 w-12 rotate-180 text-blue-600" />
              </div>

              {/* Stars */}
              <div className="mb-6 flex gap-1">
                {[...Array(5)].map((_, starIndex) => (
                  <Star
                    key={starIndex}
                    className="h-4 w-4 fill-amber-400 text-amber-400"
                  />
                ))}
              </div>

              {/* Content */}
              <blockquote className="mb-8 flex-1">
                <p className="text-lg leading-relaxed font-medium text-slate-700">
                  "{t.content}"
                </p>
              </blockquote>

              {/* Author Info */}
              <div className="flex items-center gap-4 border-t border-slate-50 pt-6">
                <div className="relative">
                  <div className="h-12 w-12 overflow-hidden rounded-full bg-slate-100 shadow-sm ring-2 ring-white">
                    <img
                      src={t.avatar}
                      alt={t.author}
                      className="h-full w-full object-cover"
                    />
                  </div>
                  {/* Verified Badge */}
                  <div className="absolute -right-1 -bottom-1 flex h-5 w-5 items-center justify-center rounded-full bg-blue-600 ring-2 ring-white">
                    <svg
                      className="h-3 w-3 text-white"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={3}
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                  </div>
                </div>
                <div>
                  <div className="font-bold text-slate-900">{t.author}</div>
                  <div className="text-sm font-medium text-slate-500">
                    {t.role}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
