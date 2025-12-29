import { Link } from '@tanstack/react-router'
import { ArrowRight, Radio, Users } from 'lucide-react'
import React from 'react'

export const Hero: React.FC = () => {
  return (
    <section className="relative overflow-hidden bg-slate-50 pt-16 pb-32 lg:pt-32">
      {/* Background Grid */}
      <div
        className="absolute inset-0 z-0 opacity-30"
        style={{
          backgroundImage: 'radial-gradient(#cbd5e1 1px, transparent 1px)',
          backgroundSize: '32px 32px',
        }}
      ></div>

      {/* Gradient Blob */}
      <div className="absolute -top-24 -right-24 -z-10 h-[500px] w-[500px] rounded-full bg-blue-400/20 blur-3xl filter" />
      <div className="absolute top-1/2 -left-24 -z-10 h-[400px] w-[400px] rounded-full bg-indigo-400/20 blur-3xl filter" />

      <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-16 lg:grid-cols-2 lg:gap-8">
          {/* Left Content */}
          <div className="flex flex-col justify-center">
            <div className="mb-6 inline-flex w-fit items-center gap-2 rounded-full border border-blue-100 bg-blue-50/50 px-3 py-1 text-xs font-semibold text-blue-600 backdrop-blur-sm">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-blue-400 opacity-75"></span>
                <span className="relative inline-flex h-2 w-2 rounded-full bg-blue-500"></span>
              </span>
              Live Now: System Design w/ @alex_dev
            </div>

            <h1 className="mb-6 text-5xl font-bold tracking-tight text-slate-900 sm:text-6xl lg:text-7xl">
              Where code finds its <span className="text-blue-600">voice</span>.
            </h1>

            <p className="mb-8 max-w-lg text-lg leading-relaxed text-slate-600">
              Stop typing, start talking. The first real-time audio platform
              built specifically for engineering context. Debug, design, and
              deploy together.
            </p>

            <div className="flex flex-col gap-4 sm:flex-row">
              <Link
                to="/feed"
                className="group inline-flex items-center justify-center gap-2 rounded-2xl bg-slate-900 px-8 py-4 text-base font-bold text-white transition-all hover:bg-slate-800 hover:shadow-lg hover:shadow-slate-900/20"
              >
                Start Listening
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Link>
              <Link
                to="/feed"
                className="inline-flex items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-white px-8 py-4 text-base font-bold text-slate-700 transition-all hover:border-slate-300 hover:bg-slate-50"
              >
                View Schedule
              </Link>
            </div>

            <div className="mt-10 flex items-center gap-4 text-sm text-slate-500">
              <div className="flex -space-x-3">
                {[1, 2, 3, 4].map((i) => (
                  <div
                    key={i}
                    className="h-10 w-10 rounded-full border-2 border-white bg-slate-200"
                    style={{
                      backgroundImage: `url(https://api.dicebear.com/7.x/avataaars/svg?seed=${i})`,
                    }}
                  />
                ))}
              </div>
              <p>Joined by 10,000+ devs</p>
            </div>
          </div>

          {/* Right Visuals - Floating Cards Composition */}
          <div className="relative mt-16 h-[450px] w-full sm:h-[500px] lg:mt-0 lg:h-full lg:min-h-[500px]">
            {/* Card 1: The "Space" */}
            <div className="absolute top-0 right-4 z-20 w-72 scale-95 rounded-3xl border border-slate-100 bg-white p-6 shadow-2xl shadow-slate-200/50 transition-transform duration-700 hover:-translate-y-2 sm:right-10 sm:w-80 sm:scale-100 lg:top-10">
              <div className="mb-4 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-red-100 text-red-600">
                    <Radio className="h-4 w-4" />
                  </div>
                  <span className="text-sm font-bold text-slate-900">
                    Live Space
                  </span>
                </div>
                <span className="rounded-full bg-slate-100 px-2 py-1 text-xs font-medium text-slate-600">
                  01:24:30
                </span>
              </div>
              <h3 className="mb-2 text-lg font-bold text-slate-900">
                Scaling Postgres to 10TB
              </h3>
              <div className="mb-6 flex flex-wrap gap-2">
                <span className="rounded-md bg-slate-100 px-2 py-1 text-xs text-slate-600">
                  #database
                </span>
                <span className="rounded-md bg-slate-100 px-2 py-1 text-xs text-slate-600">
                  #backend
                </span>
              </div>
              <div className="flex items-center justify-between border-t border-slate-100 pt-4">
                <div className="flex items-center gap-2">
                  <div
                    className="h-8 w-8 rounded-full bg-slate-200"
                    style={{
                      backgroundImage:
                        'url(https://api.dicebear.com/7.x/avataaars/svg?seed=Felix)',
                    }}
                  ></div>
                  <div className="text-xs">
                    <p className="font-bold text-slate-900">Felix</p>
                    <p className="text-slate-500">Host</p>
                  </div>
                </div>
                <div className="flex items-center gap-1 text-slate-400">
                  <Users className="h-4 w-4" />
                  <span className="text-xs font-medium">248</span>
                </div>
              </div>
            </div>

            {/* Card 2: The "Code" Context */}
            <div className="absolute top-36 left-0 z-10 w-64 scale-95 -rotate-3 rounded-3xl border border-slate-200 bg-slate-900 p-5 shadow-2xl transition-transform duration-500 hover:scale-105 hover:rotate-0 sm:top-40 sm:w-72 sm:scale-100">
              <div className="mb-3 flex items-center gap-2">
                <div className="h-3 w-3 rounded-full bg-red-500"></div>
                <div className="h-3 w-3 rounded-full bg-yellow-500"></div>
                <div className="h-3 w-3 rounded-full bg-green-500"></div>
              </div>
              <div className="space-y-2 font-mono text-xs text-slate-400">
                <p>
                  <span className="text-purple-400">function</span>{' '}
                  <span className="text-blue-400">optimize</span>() {'{'}
                </p>
                <p className="pl-4 text-slate-500">// Discussing this block</p>
                <p className="pl-4">
                  <span className="text-purple-400">const</span> cache ={' '}
                  <span className="text-yellow-300">new</span> Map();
                </p>
                <p className="pl-4">return cache.get(key);</p>
                <p>{'}'}</p>
              </div>
            </div>

            {/* Card 3: The "Reaction" */}
            <div className="absolute right-4 bottom-4 z-30 w-60 scale-95 rotate-6 rounded-2xl border border-slate-100 bg-white/80 p-4 shadow-xl backdrop-blur-md transition-transform duration-500 hover:rotate-0 sm:right-20 sm:bottom-20 sm:w-64 sm:scale-100">
              <div className="flex items-start gap-3">
                <div className="h-10 w-10 flex-shrink-0 rounded-full bg-indigo-100 p-1">
                  <img
                    src="https://api.dicebear.com/7.x/avataaars/svg?seed=Sarah"
                    alt="Sarah"
                    className="h-full w-full rounded-full"
                  />
                </div>
                <div>
                  <p className="text-sm font-bold text-slate-900">Sarah Chen</p>
                  <p className="text-xs text-slate-500">Product Director</p>
                  <div className="mt-2 rounded-lg rounded-tl-none bg-blue-50 p-2 text-xs font-medium text-blue-700">
                    "This architecture review is exactly what I needed."
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
