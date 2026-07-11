import { GoogleIcon } from '@/components/icons/signin-button-icons'
import {
  ArrowRight,
  Hand,
  Headphones,
  Heart,
  MoreHorizontal,
  Radio,
} from 'lucide-react'
import React from 'react'
import { useHomeCta } from '../../hooks/use-home-cta'
import { AVATAR_COLORS, HERO_AVATARS } from '../data/data'
import { Eyebrow } from '../ui/eyebrow'
import { InitialsAvatar } from '../ui/initials-avatar'
import { LiveCount } from '../ui/live-count'
import { PingDot } from '../ui/ping-dot'
import { Reveal } from '../ui/reveal'
import { Waveform } from '../ui/waveform'

export const Hero: React.FC = () => {
  const { isLoggedIn, startSpace } = useHomeCta()

  return (
    <section className="relative overflow-hidden pt-36 pb-24 lg:pt-44 lg:pb-40">
      {/* Subtle top light + editorial guides */}
      <div className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-[520px] bg-gradient-to-b from-white to-slate-50" />
      <div className="grid-guides pointer-events-none absolute inset-x-0 top-0 -z-10 mx-auto h-[520px] max-w-[1200px] opacity-60" />

      <div className="mx-auto grid max-w-[1200px] grid-cols-1 items-center gap-14 px-5 sm:px-6 lg:grid-cols-[1.02fr_.98fr] lg:gap-10 lg:px-8">
        {/* Left */}
        <div>
          <Reveal className="flex items-center gap-2.5">
            <Eyebrow className="text-blue-600">
              Live audio for engineers
            </Eyebrow>
            <span className="h-px w-8 bg-slate-300" />
          </Reveal>

          <Reveal delay={0.05}>
            <h1 className="mt-5 text-[2.9rem] font-bold leading-[1.02] tracking-tightest text-slate-900 sm:text-6xl lg:text-[4.1rem]">
              Where engineers
              <br className="hidden sm:block" /> talk shop,{' '}
              <span className="text-blue-600">live</span>.
            </h1>
          </Reveal>

          <Reveal delay={0.12}>
            <p className="mt-6 max-w-xl text-lg leading-relaxed text-slate-600">
              Averysync is real-time audio for developers. Drop into a Space,
              jump into the conversation, and build your reputation one room at
              a time — no scheduling, no slide decks, just signal.
            </p>
          </Reveal>

          <Reveal delay={0.18} className="mt-8 flex flex-col gap-3 sm:flex-row">
            <button
              type="button"
              onClick={startSpace}
              className="group inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-6 py-3.5 text-base font-semibold text-white shadow-soft transition-all hover:-translate-y-0.5 hover:bg-blue-700"
            >
              {!isLoggedIn && (
                <span className="flex h-6 w-6 flex-none items-center justify-center rounded-full bg-white">
                  <GoogleIcon />
                </span>
              )}
              Start a Space
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </button>
            <a
              href="#spaces"
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-6 py-3.5 text-base font-semibold text-slate-700 transition-all hover:border-slate-300 hover:bg-slate-50"
            >
              <Radio className="h-4 w-4 text-blue-600" />
              Explore live rooms
            </a>
          </Reveal>

          <Reveal delay={0.24} className="mt-10 flex items-center gap-4">
            <div className="flex -space-x-2.5">
              {HERO_AVATARS.map((avatar) => (
                <InitialsAvatar
                  key={avatar.initials}
                  initials={avatar.initials}
                  color={avatar.color}
                  className="h-9 w-9 text-[11px] ring-2 ring-slate-50"
                />
              ))}
            </div>
            <p className="text-sm text-slate-500">
              <span className="font-semibold text-slate-700">
                10,400+ engineers
              </span>{' '}
              already talking
            </p>
          </Reveal>
        </div>

        {/* Right: Live Space product panel */}
        <Reveal delay={0.1} className="relative">
          <div className="relative z-10 rounded-3xl border border-slate-200/70 bg-white p-5 shadow-panel sm:p-6">
            <div className="flex items-center justify-between">
              <span className="inline-flex items-center gap-2 rounded-full bg-rose-50 px-3 py-1.5 text-xs font-bold text-rose-600">
                <PingDot />
                LIVE
              </span>
              <div className="flex items-center gap-3">
                <span className="font-mono text-xs text-slate-400">12:04</span>
                <MoreHorizontal className="h-4 w-4 text-slate-300" />
              </div>
            </div>

            <h3 className="mt-4 text-xl font-bold tracking-tight text-slate-900">
              Scaling Postgres to 10k writes/sec
            </h3>
            <div className="mt-2.5 flex flex-wrap gap-1.5">
              {['#postgres', '#backend', '#scaling'].map((tag) => (
                <span
                  key={tag}
                  className="rounded-md bg-slate-100 px-2 py-0.5 font-mono text-[11px] text-slate-500"
                >
                  {tag}
                </span>
              ))}
            </div>

            <Waveform
              bars={48}
              className="mt-5 h-16 gap-[3px] overflow-hidden rounded-2xl bg-slate-50 px-4 ring-1 ring-slate-100"
            />

            <div className="mt-5 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <InitialsAvatar
                  initials="MP"
                  color={AVATAR_COLORS.blue}
                  className="h-11 w-11 text-sm"
                  speaking
                />
                <div className="leading-tight">
                  <p className="text-sm font-bold text-slate-900">Maya Patel</p>
                  <p className="text-xs text-slate-500">Host · speaking</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="flex -space-x-2">
                  <InitialsAvatar
                    initials="DS"
                    color={AVATAR_COLORS.indigo}
                    className="h-8 w-8 text-[10px] ring-2 ring-white"
                  />
                  <InitialsAvatar
                    initials="RK"
                    color={AVATAR_COLORS.slate}
                    className="h-8 w-8 text-[10px] ring-2 ring-white"
                  />
                  <InitialsAvatar
                    initials="LM"
                    color={AVATAR_COLORS.amber}
                    className="h-8 w-8 text-[10px] ring-2 ring-white"
                  />
                </div>
                <div className="flex items-center gap-1.5 text-slate-500">
                  <Headphones className="h-4 w-4" />
                  <LiveCount
                    initial={42}
                    className="text-sm font-semibold text-slate-700"
                  />
                </div>
              </div>
            </div>

            <div className="mt-5 flex items-center gap-2 border-t border-slate-100 pt-4">
              <button
                type="button"
                onClick={startSpace}
                className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-blue-700"
              >
                <Hand className="h-4 w-4" /> Request to speak
              </button>
              <button
                type="button"
                onClick={startSpace}
                className="inline-flex items-center justify-center gap-1.5 rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm font-semibold text-slate-600 transition-colors hover:bg-slate-50"
              >
                <Heart className="h-4 w-4" /> 128
              </button>
            </div>
          </div>

          {/* Floating code-snippet card */}
          <div
            className="floaty absolute -bottom-16 -left-10 z-0 hidden w-60 -rotate-2 rounded-2xl border border-slate-800 bg-slate-900 p-4 shadow-panel xl:-left-16 xl:block"
            style={{ animationDelay: '.6s' }}
          >
            <div className="mb-3 flex items-center gap-1.5">
              <span className="h-2.5 w-2.5 rounded-full bg-slate-700" />
              <span className="h-2.5 w-2.5 rounded-full bg-slate-700" />
              <span className="h-2.5 w-2.5 rounded-full bg-slate-700" />
              <span className="ml-auto font-mono text-[10px] text-slate-600">
                optimize.ts
              </span>
            </div>
            <div className="space-y-1.5 font-mono text-[11px] leading-relaxed text-slate-400">
              <p>
                <span className="text-indigo-400">function</span>{' '}
                <span className="text-blue-400">optimize</span>() {'{'}
              </p>
              <p className="pl-3 text-slate-600">// discussing this block</p>
              <p className="pl-3">
                <span className="text-indigo-400">const</span> cache ={' '}
                <span className="text-amber-300">new</span> Map();
              </p>
              <p className="pl-3">
                <span className="text-indigo-400">return</span> cache.get(key);
              </p>
              <p>{'}'}</p>
            </div>
          </div>

          {/* Floating quote card */}
          <div
            className="floaty absolute -right-6 -bottom-14 z-0 hidden w-64 rotate-2 rounded-2xl border border-slate-200/70 bg-white p-4 shadow-panel lg:block xl:-right-12"
            style={{ animationDelay: '1.4s' }}
          >
            <div className="flex items-start gap-3">
              <InitialsAvatar
                initials="SC"
                color={AVATAR_COLORS.slate}
                className="h-10 w-10 flex-none text-xs"
              />
              <div className="min-w-0">
                <p className="text-sm font-bold text-slate-900">Sarah Chen</p>
                <p className="text-xs text-slate-500">Product Director</p>
                <div className="mt-2 rounded-xl rounded-tl-sm bg-blue-50 p-2.5 text-xs font-medium leading-relaxed text-blue-700">
                  "This architecture review is exactly what I needed."
                </div>
              </div>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  )
}
