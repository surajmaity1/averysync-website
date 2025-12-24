import React from 'react'
import { TESTIMONIALS } from '../data/data'

export const Testimonials: React.FC = () => {
  return (
    <section id="testimonials" className="bg-white py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-16 text-center">
          <button
            onClick={() =>
              (window.location.href = 'http://discord.gg/ZhbqDN9fz4')
            }
            className="cursor-pointer rounded-lg bg-blue-500 px-4 py-2 text-sm font-medium text-white transition-all hover:bg-blue-600 hover:shadow-lg"
          >
            Join Discord Community
          </button>
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
