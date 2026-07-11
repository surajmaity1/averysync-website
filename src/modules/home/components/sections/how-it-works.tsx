import { Search } from 'lucide-react'
import React from 'react'
import { AVATAR_COLORS, STEPS } from '../data/data'
import { Eyebrow } from '../ui/eyebrow'
import { InitialsAvatar } from '../ui/initials-avatar'
import { Reveal } from '../ui/reveal'
import { Waveform } from '../ui/waveform'

/** Bespoke footer visual for each of the three steps. */
const STEP_VISUALS: React.ReactNode[] = [
  <div
    key="search"
    className="mt-5 flex items-center gap-2 rounded-2xl border border-slate-200 bg-slate-50/60 p-3"
  >
    <Search className="h-4 w-4 text-slate-400" />
    <span className="font-mono text-xs text-slate-500">
      postgres, rust, design-systems…
    </span>
  </div>,
  <Waveform
    key="wave"
    bars={40}
    className="mt-5 h-[52px] gap-[3px] overflow-hidden rounded-2xl border border-slate-200 bg-slate-50/60 px-4"
  />,
  <div
    key="connections"
    className="mt-5 flex items-center gap-2 rounded-2xl border border-slate-200 bg-slate-50/60 p-3"
  >
    <div className="flex -space-x-2">
      <InitialsAvatar
        initials="MP"
        color={AVATAR_COLORS.blue}
        className="h-7 w-7 text-[10px] ring-2 ring-slate-50"
      />
      <InitialsAvatar
        initials="DS"
        color={AVATAR_COLORS.indigo}
        className="h-7 w-7 text-[10px] ring-2 ring-slate-50"
      />
      <InitialsAvatar
        initials="JW"
        color={AVATAR_COLORS.teal}
        className="h-7 w-7 text-[10px] ring-2 ring-slate-50"
      />
    </div>
    <span className="font-mono text-xs text-slate-500">
      +3 new connections
    </span>
  </div>,
]

export const HowItWorks: React.FC = () => {
  return (
    <section className="border-y border-slate-200/70 bg-white py-24 lg:py-28">
      <div className="mx-auto max-w-[1200px] px-5 sm:px-6 lg:px-8">
        <Reveal className="max-w-2xl">
          <Eyebrow className="text-blue-600">How it works</Eyebrow>
          <h2 className="mt-4 text-3xl font-bold tracking-tightest text-slate-900 sm:text-4xl">
            From lurker to speaker in three steps
          </h2>
        </Reveal>

        <div className="relative mt-14 grid grid-cols-1 gap-8 md:grid-cols-3">
          {/* Connecting line */}
          <div className="pointer-events-none absolute top-7 right-0 left-0 hidden h-px bg-gradient-to-r from-transparent via-slate-200 to-transparent md:block" />

          {STEPS.map((step, i) => (
            <Reveal key={step.title} delay={i * 0.1} className="relative">
              <div className="flex items-center gap-4">
                <span className="flex h-14 w-14 flex-none items-center justify-center rounded-2xl border border-slate-200 bg-white font-mono text-sm font-semibold text-blue-600 shadow-sm">
                  {String(i + 1).padStart(2, '0')}
                </span>
                <div className="h-px flex-1 bg-slate-100 md:hidden" />
              </div>
              <h3 className="mt-6 text-xl font-bold tracking-tight text-slate-900">
                {step.title}
              </h3>
              <p className="mt-2.5 leading-relaxed text-slate-600">
                {step.description}
              </p>
              {STEP_VISUALS[i]}
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  )
}
