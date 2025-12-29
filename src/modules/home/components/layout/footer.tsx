import {
  ArrowRight,
  Cpu,
  Github,
  Linkedin,
  Twitter,
  Youtube,
} from 'lucide-react'
import React from 'react'

export const Footer: React.FC = () => {
  const currentYear = new Date().getFullYear()

  return (
    <footer className="bg-slate-950 pt-24 pb-12 text-slate-400">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-12 lg:grid-cols-12 lg:gap-8">
          {/* Brand Column */}
          <div className="lg:col-span-4">
            <div className="mb-6 flex items-center gap-2.5 text-white">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 shadow-lg shadow-blue-900/20">
                <Cpu className="h-6 w-6 text-white" />
              </div>
              <span className="text-xl font-bold tracking-tight">
                Averysync
              </span>
            </div>
            <p className="mb-8 text-base leading-relaxed text-slate-400">
              The real-time voice platform for engineering teams. Debug faster,
              design better, and build culture without the burnout.
            </p>
            <div className="flex items-center gap-2 text-sm font-medium text-emerald-400">
              <span className="relative flex h-2.5 w-2.5">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-emerald-500"></span>
              </span>
              All systems operational
            </div>
          </div>

          {/* Links Columns */}
          <div className="grid grid-cols-2 gap-8 sm:grid-cols-3 lg:col-span-8 lg:pl-12">
            <div>
              <h3 className="mb-4 text-sm font-semibold tracking-wider text-white uppercase">
                Product
              </h3>
              <ul className="space-y-3 text-sm">
                {[
                  'Features',
                  'Integrations',
                  'Enterprise',
                  'Changelog',
                  'Docs',
                ].map((item) => (
                  <li key={item}>
                    <a
                      href="#"
                      className="transition-colors hover:text-blue-400"
                    >
                      {item}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h3 className="mb-4 text-sm font-semibold tracking-wider text-white uppercase">
                Company
              </h3>
              <ul className="space-y-3 text-sm">
                {['About', 'Careers', 'Blog', 'Contact', 'Partners'].map(
                  (item) => (
                    <li key={item}>
                      <a
                        href="#"
                        className="transition-colors hover:text-blue-400"
                      >
                        {item}
                      </a>
                    </li>
                  ),
                )}
              </ul>
            </div>
            <div className="col-span-2 sm:col-span-1">
              <h3 className="mb-4 text-sm font-semibold tracking-wider text-white uppercase">
                Stay up to date
              </h3>
              <p className="mb-4 text-sm text-slate-400">
                Subscribe to our newsletter for the latest engineering updates.
              </p>
              <form className="flex flex-col gap-2">
                <input
                  type="email"
                  placeholder="Enter your email"
                  className="w-full rounded-lg border border-slate-800 bg-slate-900 px-3 py-2 text-sm text-white placeholder-slate-500 transition-colors focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none"
                />
                <button
                  type="submit"
                  className="flex items-center justify-center gap-2 rounded-lg bg-blue-600 px-3 py-2 text-sm font-semibold text-white transition-all hover:bg-blue-500"
                >
                  Subscribe <ArrowRight className="h-4 w-4" />
                </button>
              </form>
            </div>
          </div>
        </div>

        <div className="mt-16 border-t border-slate-800 pt-8">
          <div className="flex flex-col items-center justify-between gap-6 md:flex-row">
            <p className="text-sm text-slate-500">
              &copy; {currentYear} Averysync Inc. All rights reserved.
            </p>
            <div className="flex gap-6">
              {[Twitter, Github, Linkedin, Youtube].map((Icon, i) => (
                <a
                  key={i}
                  href="#"
                  className="text-slate-500 transition-colors hover:text-white"
                >
                  <Icon className="h-5 w-5" />
                </a>
              ))}
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}
