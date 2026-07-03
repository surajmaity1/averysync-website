import { Github, Linkedin, Twitter, Youtube } from 'lucide-react'
import React from 'react'
import { FOOTER_LINKS } from '../data/data'
import { BrandMark } from '../ui/brand-mark'
import { Eyebrow } from '../ui/eyebrow'
import { PingDot } from '../ui/ping-dot'

const SOCIAL_LINKS = [
  { label: 'Twitter', icon: Twitter },
  { label: 'GitHub', icon: Github },
  { label: 'LinkedIn', icon: Linkedin },
  { label: 'YouTube', icon: Youtube },
]

export const Footer: React.FC = () => {
  const currentYear = new Date().getFullYear()

  return (
    <footer className="border-t border-slate-200 bg-white pt-20 pb-10">
      <div className="mx-auto max-w-[1200px] px-5 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 gap-10 sm:grid-cols-4 lg:grid-cols-12">
          <div className="col-span-2 lg:col-span-5">
            <a href="#top" className="flex items-center gap-2.5">
              <BrandMark />
              <span className="tracking-tightest text-lg font-bold text-slate-900">
                Averysync
              </span>
            </a>
            <p className="mt-5 max-w-sm text-sm leading-relaxed text-slate-500">
              Real-time audio for engineering teams. Debug faster, design
              better, and build culture without the burnout.
            </p>
            <div className="mt-6 flex items-center gap-2 text-sm font-medium text-emerald-600">
              <PingDot color="emerald" className="h-2.5 w-2.5" />
              All systems operational
            </div>
          </div>

          {FOOTER_LINKS.map((group, i) => (
            <div
              key={group.heading}
              className={
                i === 0 ? 'lg:col-span-2 lg:col-start-8' : 'lg:col-span-2'
              }
            >
              <Eyebrow className="block text-slate-400">
                {group.heading}
              </Eyebrow>
              <ul className="mt-4 space-y-3 text-sm text-slate-500">
                {group.links.map((link) => (
                  <li key={link.label}>
                    <a
                      href={link.href}
                      className="transition-colors hover:text-blue-600"
                    >
                      {link.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-16 flex flex-col items-center justify-between gap-6 border-t border-slate-100 pt-8 md:flex-row">
          <p className="text-sm text-slate-400">
            © {currentYear} Averysync Inc. All rights reserved.
          </p>
          <div className="flex gap-5 text-slate-400">
            {SOCIAL_LINKS.map(({ label, icon: Icon }) => (
              <a
                key={label}
                href="#"
                className="transition-colors hover:text-slate-900"
                aria-label={label}
              >
                <Icon className="h-5 w-5" />
              </a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  )
}
