import { ArrowRight, Search } from 'lucide-react'
import React from 'react'

export const Hero: React.FC = () => {
  return (
    <section className="relative overflow-hidden pt-20 pb-32">
      <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-4xl text-center">
          <div className="animate-fade-in mb-8 inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-600 shadow-sm">
            <span className="h-2 w-2 animate-pulse rounded-full bg-green-500"></span>
            2,405 developers are debugging right now
          </div>

          <h1 className="mb-8 text-5xl leading-[1.1] font-extrabold tracking-tight text-slate-900 md:text-7xl">
            Social networking for <br className="hidden md:block" />
            <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
              serious problem solvers.
            </span>
          </h1>

          <p className="mx-auto mb-10 max-w-2xl text-xl leading-relaxed text-slate-600">
            Connect with engineers worldwide. Share knowledge, debug complex
            issues in real-time, and build your professional reputation.
          </p>

          <div className="mb-20 flex flex-col justify-center gap-4 sm:flex-row">
            <button className="flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-8 py-4 text-lg font-bold text-white shadow-xl shadow-blue-200 transition-all hover:scale-[1.02] hover:bg-blue-700">
              Start Solving <ArrowRight className="h-5 w-5" />
            </button>
            <button className="flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-8 py-4 text-lg font-bold text-slate-700 transition-colors hover:bg-slate-50">
              <Search className="h-5 w-5" /> Browse Issues
            </button>
          </div>

          {/* Hero Graphic / Mockup */}
          <div className="relative mx-auto max-w-5xl overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl">
            <div className="flex h-10 items-center gap-2 bg-slate-900 px-4">
              <div className="h-3 w-3 rounded-full bg-red-500"></div>
              <div className="h-3 w-3 rounded-full bg-yellow-500"></div>
              <div className="h-3 w-3 rounded-full bg-green-500"></div>
              <div className="ml-4 font-mono text-xs text-slate-400">
                feed.tsx — @alex_dev
              </div>
            </div>
            <div className="grid aspect-[16/8] grid-cols-1 md:grid-cols-3">
              {/* Left: Code Snippet */}
              <div className="col-span-2 border-r border-slate-800 bg-slate-900 p-6 font-mono text-sm text-slate-300">
                <p>
                  <span className="text-purple-400">const</span>{' '}
                  <span className="text-blue-400">solveIssue</span> ={' '}
                  <span className="text-yellow-300">async</span> (bug){' '}
                  <span className="text-purple-400">=&gt;</span> &#123;
                </p>
                <p className="pl-4 text-slate-500">
                  // Connecting to community expert...
                </p>
                <p className="pl-4">
                  <span className="text-purple-400">await</span> community.
                  <span className="text-blue-400">connect</span>();
                </p>
                <p className="pl-4">
                  <span className="text-purple-400">return</span> solution;
                </p>
                <p>&#125;</p>
              </div>
              {/* Right: Social Chat Mockup */}
              <div className="col-span-1 flex flex-col bg-white p-4">
                <div className="mb-4 flex items-center gap-3 rounded-lg bg-blue-50 p-3">
                  <div className="h-8 w-8 rounded-full bg-blue-200"></div>
                  <div>
                    <div className="text-xs font-bold text-slate-900">
                      Sarah (Expert)
                    </div>
                    <div className="text-xs text-slate-500">Typing...</div>
                  </div>
                </div>
                <div className="space-y-3">
                  <div className="w-3/4 rounded-lg rounded-tl-none bg-slate-100 p-2 text-xs text-slate-600">
                    Check your async dependencies in the useEffect.
                  </div>
                  <div className="ml-auto w-3/4 rounded-lg rounded-tr-none bg-blue-600 p-2 text-xs text-white">
                    That worked! Thanks Sarah.
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Background Decor */}
      <div className="absolute inset-x-0 top-0 -z-10 h-full bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-blue-50 via-white to-white"></div>
    </section>
  )
}
