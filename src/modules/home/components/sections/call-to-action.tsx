import { GoogleIcon } from '@/components/icons/signin-button-icons'
import { ArrowRight, Radio } from 'lucide-react'
import React from 'react'
import { useHomeCta } from '../../hooks/use-home-cta'
import { Eyebrow } from '../ui/eyebrow'
import { LiveCount } from '../ui/live-count'

export const CallToAction: React.FC = () => {
  const { isLoggedIn, startSpace } = useHomeCta()

  return (
    <section id="cta" className="px-5 pb-24 sm:px-6 lg:px-8">
      <div className="relative mx-auto max-w-[1200px] overflow-hidden rounded-[2rem] bg-slate-900 px-6 py-20 sm:px-12 lg:py-24">
        <div className="pointer-events-none absolute -top-24 -right-20 h-80 w-80 rounded-full bg-blue-600/20 blur-[100px]" />
        <div className="relative z-10 mx-auto flex max-w-2xl flex-col items-center text-center">
          <Eyebrow className="text-blue-400">Early access open</Eyebrow>
          <h2 className="mt-5 text-4xl font-bold tracking-tightest text-white sm:text-5xl">
            Ready to find your people?
          </h2>
          <p className="mt-5 max-w-xl text-lg leading-relaxed text-slate-400">
            Join the network where technical conversations happen naturally. No
            scheduling, no agendas — just pure engineering signal.
          </p>
          <div className="mt-9 flex flex-col gap-3 sm:flex-row">
            <button
              type="button"
              onClick={startSpace}
              className="group inline-flex items-center justify-center gap-2 rounded-xl bg-white px-7 py-3.5 text-base font-semibold text-slate-900 transition-all hover:-translate-y-0.5 hover:bg-blue-50"
            >
              {!isLoggedIn && <GoogleIcon />}
              Get started free
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </button>
            <a
              href="#spaces"
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/15 bg-white/5 px-7 py-3.5 text-base font-semibold text-white backdrop-blur-sm transition-all hover:bg-white/10"
            >
              <Radio className="h-4 w-4 text-blue-400" /> Browse live rooms
            </a>
          </div>
          <p className="mt-6 font-mono text-xs text-slate-500">
            No credit card ·{' '}
            <LiveCount initial={47} className="text-emerald-400" /> rooms live
            right now
          </p>
        </div>
      </div>
    </section>
  )
}
