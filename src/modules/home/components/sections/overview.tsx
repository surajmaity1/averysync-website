import React from 'react'
import { STATS } from '../data/data'

const Overview: React.FC = () => {
  return (
    <section className="border-y border-slate-100 bg-white py-12">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-12 text-center md:grid-cols-3">
          {STATS.map((stat) => (
            <div key={stat.label}>
              <p className="mb-1 text-4xl font-black text-slate-900">
                {stat.value}
              </p>
              <p className="text-sm font-semibold tracking-wide text-slate-500 uppercase">
                {stat.label}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

export default Overview
