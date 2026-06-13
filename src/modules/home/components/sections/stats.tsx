import { Clock, Radio, Users } from 'lucide-react'
import React from 'react'
import { STATS } from '../data/data'

export const Stats: React.FC = () => {
  const icons = [Radio, Users, Clock]

  return (
    <section className="relative z-20 -mt-24 pb-12">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="rounded-[2.5rem] border border-slate-200 bg-white p-8 shadow-2xl shadow-slate-200/50 sm:p-12">
          <div className="grid grid-cols-1 gap-12 divide-y divide-slate-100 md:grid-cols-3 md:gap-0 md:divide-x md:divide-y-0">
            {STATS.map((stat, i) => {
              const Icon = icons[i] || Users
              return (
                <div
                  key={stat.label}
                  className="group flex flex-col items-center justify-center px-6 transition-all md:flex-row md:justify-start"
                >
                  <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-50 text-blue-600 transition-all duration-300 group-hover:scale-110 group-hover:bg-blue-600 group-hover:text-white group-hover:shadow-lg group-hover:shadow-blue-500/30 md:mr-6 md:mb-0">
                    <Icon className="h-8 w-8" strokeWidth={1.5} />
                  </div>
                  <div className="text-center md:text-left">
                    <p className="text-4xl font-bold tracking-tight text-slate-900">
                      {stat.value}
                      <span className="text-blue-600">+</span>
                    </p>
                    <p className="mt-1 text-sm font-semibold tracking-wide text-slate-500">
                      {stat.label}
                    </p>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </section>
  )
}
