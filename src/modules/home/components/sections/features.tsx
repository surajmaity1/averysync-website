import { BadgeCheck, Globe, Newspaper, Radio } from 'lucide-react'
import React from 'react'
import { Eyebrow } from '../ui/eyebrow'
import { InitialsAvatar } from '../ui/initials-avatar'
import { Reveal } from '../ui/reveal'
import { Waveform } from '../ui/waveform'

const REGION_AVATARS = [
  { initials: 'SF', color: { bg: '#1d4ed8', fg: '#ffffff' } },
  { initials: 'LN', color: { bg: '#4338ca', fg: '#ffffff' } },
  { initials: 'SG', color: { bg: '#0f766e', fg: '#ffffff' } },
  { initials: 'BE', color: { bg: '#b45309', fg: '#ffffff' } },
]

export const Features: React.FC = () => {
  return (
    <section id="features" className="py-24 lg:py-28">
      <div className="mx-auto max-w-[1200px] px-5 sm:px-6 lg:px-8">
        <Reveal className="flex flex-col justify-between gap-6 md:flex-row md:items-end">
          <div className="max-w-2xl">
            <Eyebrow className="text-blue-600">Capabilities</Eyebrow>
            <h2 className="mt-4 text-3xl font-bold tracking-tightest text-slate-900 sm:text-4xl">
              Built for the way engineers actually communicate
            </h2>
          </div>
        </Reveal>

        <div className="mt-12 grid grid-cols-1 gap-5 md:grid-cols-6">
          {/* Live Spaces (large) */}
          <Reveal className="group relative flex flex-col justify-between overflow-hidden rounded-3xl border border-slate-200 bg-white p-8 md:col-span-4">
            <div>
              <div className="flex items-center gap-3">
                <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-blue-600 text-white shadow-soft">
                  <Radio className="h-5 w-5" />
                </span>
                <span className="font-mono text-xs text-slate-300">01</span>
              </div>
              <h3 className="mt-6 text-2xl font-bold tracking-tight text-slate-900">
                Live Spaces
              </h3>
              <p className="mt-3 max-w-md text-base leading-relaxed text-slate-600">
                Real-time audio rooms for design reviews, architecture debates,
                and career talk — like the hallway track at a conference,
                always open.
              </p>
            </div>
            <Waveform
              bars={56}
              className="mt-8 h-16 items-end gap-[3px] overflow-hidden rounded-2xl bg-slate-50 px-4 py-3 ring-1 ring-slate-100"
            />
          </Reveal>

          {/* Community Feed */}
          <Reveal
            delay={0.08}
            className="group relative flex flex-col justify-between overflow-hidden rounded-3xl border border-slate-200 bg-white p-8 md:col-span-2"
          >
            <div>
              <div className="flex items-center gap-3">
                <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-slate-100 text-slate-700 transition-colors group-hover:bg-blue-50 group-hover:text-blue-600">
                  <Newspaper className="h-5 w-5" />
                </span>
                <span className="font-mono text-xs text-slate-300">02</span>
              </div>
              <h3 className="mt-6 text-2xl font-bold tracking-tight text-slate-900">
                Community Feed
              </h3>
              <p className="mt-3 text-base leading-relaxed text-slate-600">
                A social feed tuned to technical signal — open source, deep
                dives, and knowledge, not hot takes.
              </p>
            </div>
          </Reveal>

          {/* Verified Solutions */}
          <Reveal
            delay={0.16}
            className="group relative flex flex-col justify-between overflow-hidden rounded-3xl border border-slate-200 bg-white p-8 md:col-span-2"
          >
            <div>
              <div className="flex items-center gap-3">
                <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-slate-100 text-slate-700 transition-colors group-hover:bg-blue-50 group-hover:text-blue-600">
                  <BadgeCheck className="h-5 w-5" />
                </span>
                <span className="font-mono text-xs text-slate-300">03</span>
              </div>
              <h3 className="mt-6 text-2xl font-bold tracking-tight text-slate-900">
                Verified Solutions
              </h3>
              <p className="mt-3 text-base leading-relaxed text-slate-600">
                A reputation system that floats the best technical answers to
                the top — no more digging through stale threads.
              </p>
            </div>
          </Reveal>

          {/* Global Town Hall (dark, large) */}
          <Reveal
            delay={0.24}
            className="group relative flex flex-col justify-between overflow-hidden rounded-3xl border border-slate-200 bg-slate-900 p-8 text-white md:col-span-4"
          >
            <div className="relative z-10">
              <div className="flex items-center gap-3">
                <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white/10 text-white ring-1 ring-white/10">
                  <Globe className="h-5 w-5" />
                </span>
                <span className="font-mono text-xs text-white/30">04</span>
              </div>
              <h3 className="mt-6 text-2xl font-bold tracking-tight">
                Global Town Hall
              </h3>
              <p className="mt-3 max-w-md text-base leading-relaxed text-slate-300">
                Live discussions happening right now, from Silicon Valley to
                Singapore. Jump into the conversations that matter to your
                niche.
              </p>
            </div>
            <div className="relative z-10 mt-8 flex items-center gap-2">
              <div className="flex -space-x-2">
                {REGION_AVATARS.map((region) => (
                  <InitialsAvatar
                    key={region.initials}
                    initials={region.initials}
                    color={region.color}
                    className="h-8 w-8 text-[10px] ring-2 ring-slate-900"
                  />
                ))}
              </div>
              <span className="font-mono text-xs text-white/50">
                14 regions live
              </span>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  )
}
