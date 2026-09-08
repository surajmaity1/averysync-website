import React from 'react'
import { STATS } from '../data/data'
import { CountUp } from '../ui/count-up'
import { Eyebrow } from '../ui/eyebrow'
import { PingDot } from '../ui/ping-dot'
import { Reveal } from '../ui/reveal'

export const Stats: React.FC = () => {
  return (
    <section className="border-y border-slate-200/70 bg-white">
      <div className="mx-auto max-w-[1200px] px-5 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 divide-slate-100 py-12 md:grid-cols-4 md:divide-x">
          {STATS.map((stat, i) => (
            <Reveal
              key={stat.label}
              delay={i * 0.08}
              className="px-4 py-3 text-center md:text-left"
            >
              <p
                className={
                  stat.live
                    ? 'tracking-tightest flex items-center justify-center gap-2.5 text-4xl font-bold text-slate-900 sm:text-5xl md:justify-start'
                    : 'tracking-tightest text-4xl font-bold text-slate-900 sm:text-5xl'
                }
              >
                {stat.live && (
                  <PingDot color="emerald" className="h-2.5 w-2.5" />
                )}
                <CountUp value={stat.value} decimals={stat.decimals} />
                {stat.suffix && (
                  <span className="text-blue-600">{stat.suffix}</span>
                )}
              </p>
              <Eyebrow className="mt-1.5 block text-slate-400">
                {stat.label}
              </Eyebrow>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  )
}
