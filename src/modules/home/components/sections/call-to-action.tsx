import { Link } from '@tanstack/react-router'
import { ArrowRight, Sparkles, Zap } from 'lucide-react'
import React from 'react'

export const CallToAction: React.FC = () => {
  return (
    <section className="px-4 py-24 sm:px-6 lg:px-8">
      <div className="relative mx-auto max-w-7xl overflow-hidden rounded-[2.5rem] bg-slate-900 px-6 py-20 shadow-2xl sm:px-12 lg:px-20">
        {/* Background Gradients */}
        <div className="absolute top-0 left-0 h-96 w-96 -translate-x-1/2 -translate-y-1/2 rounded-full bg-blue-500/30 blur-3xl"></div>
        <div className="absolute right-0 bottom-0 h-96 w-96 translate-x-1/2 translate-y-1/2 rounded-full bg-indigo-500/30 blur-3xl"></div>

        {/* Grid Pattern Overlay */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.05)_1px,transparent_1px)] [mask-image:radial-gradient(ellipse_60%_60%_at_50%_50%,#000_70%,transparent_100%)] bg-[size:4rem_4rem]"></div>

        <div className="relative z-10 flex flex-col items-center text-center">
          {/* Badge */}
          <div className="mb-8 inline-flex items-center gap-2 rounded-full border border-slate-700 bg-slate-800/50 px-4 py-1.5 text-sm font-medium text-blue-300 backdrop-blur-sm">
            <Sparkles className="h-4 w-4 text-yellow-400" />
            <span>Early access open for teams</span>
          </div>

          <h2 className="mb-6 max-w-3xl text-4xl font-bold tracking-tight text-white sm:text-5xl md:text-6xl">
            Ready to find your{' '}
            <span className="bg-gradient-to-r from-blue-400 to-indigo-400 bg-clip-text text-transparent">
              frequency
            </span>
            ?
          </h2>

          <p className="mb-10 max-w-2xl text-lg leading-relaxed text-slate-400">
            Join the network where technical conversations happen naturally. No
            scheduling, no formal agendas—just pure engineering signal.
          </p>

          <div className="flex w-full flex-col gap-4 sm:w-auto sm:flex-row">
            <Link
              to="/feed"
              className="group relative inline-flex items-center justify-center gap-2 overflow-hidden rounded-full bg-white px-8 py-4 text-base font-bold text-slate-900 transition-all hover:scale-105 hover:bg-blue-50"
            >
              <span className="relative z-10">Get Started Now</span>
              <ArrowRight className="relative z-10 h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Link>

            <Link
              to="/feed"
              className="inline-flex items-center justify-center gap-2 rounded-full border border-slate-700 bg-slate-800/50 px-8 py-4 text-base font-bold text-white backdrop-blur-sm transition-all hover:border-slate-600 hover:bg-slate-800"
            >
              <Zap className="h-4 w-4 text-yellow-400" />
              View Live Demo
            </Link>
          </div>
        </div>
      </div>
    </section>
  )
}
