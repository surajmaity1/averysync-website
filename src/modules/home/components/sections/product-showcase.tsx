import {
  Bell,
  Bookmark,
  Lock,
  MessageCircle,
  MessageSquareText,
  Newspaper,
  Radio,
  Search,
  Share2,
  ThumbsUp,
  TrendingUp,
} from 'lucide-react'
import React from 'react'
import { AVATAR_COLORS } from '../data/data'
import { BrandMark } from '../ui/brand-mark'
import { Eyebrow } from '../ui/eyebrow'
import { InitialsAvatar } from '../ui/initials-avatar'
import { PingDot } from '../ui/ping-dot'
import { Reveal } from '../ui/reveal'
import { Waveform } from '../ui/waveform'

/** Static mock of the in-app feed, framed inside browser chrome. */
export const ProductShowcase: React.FC = () => {
  return (
    <section
      id="product"
      className="border-y border-slate-200/70 bg-white py-24 lg:py-28"
    >
      <div className="mx-auto max-w-[1200px] px-5 sm:px-6 lg:px-8">
        <Reveal className="mx-auto max-w-2xl text-center">
          <Eyebrow className="text-blue-600">The product</Eyebrow>
          <h2 className="tracking-tightest mt-4 text-3xl font-bold text-slate-900 sm:text-4xl">
            Your feed, tuned to signal
          </h2>
          <p className="mt-3 text-lg text-slate-600">
            Live Spaces, a technical feed, and the people worth following — in
            one calm, focused home.
          </p>
        </Reveal>

        <Reveal delay={0.1} className="mt-14">
          <div className="shadow-panel mx-auto max-w-[1080px] overflow-hidden rounded-2xl border border-slate-200 bg-white">
            {/* Window chrome */}
            <div className="flex items-center gap-3 border-b border-slate-100 bg-slate-50/80 px-4 py-3">
              <div className="flex gap-1.5">
                <span className="h-3 w-3 rounded-full bg-slate-200" />
                <span className="h-3 w-3 rounded-full bg-slate-200" />
                <span className="h-3 w-3 rounded-full bg-slate-200" />
              </div>
              <div className="mx-auto flex items-center gap-2 rounded-md bg-white px-3 py-1 text-xs text-slate-400 ring-1 ring-slate-100">
                <Lock className="h-3 w-3" /> averysync.app/feed
              </div>
            </div>

            {/* App top bar */}
            <div className="flex items-center gap-4 border-b border-slate-100 px-5 py-3">
              <div className="flex items-center gap-2">
                <BrandMark size="sm" />
                <span className="text-sm font-bold tracking-tight text-slate-900">
                  Averysync
                </span>
              </div>
              <div className="hidden flex-1 items-center gap-2 rounded-full bg-slate-100 px-3 py-1.5 sm:flex">
                <Search className="h-3.5 w-3.5 text-slate-400" />
                <span className="text-xs text-slate-400">
                  Search spaces, people, topics
                </span>
              </div>
              <div className="ml-auto flex items-center gap-2">
                <span className="flex h-7 w-7 items-center justify-center rounded-full text-slate-400">
                  <Bell className="h-4 w-4" />
                </span>
                <span className="inline-flex items-center gap-1.5 rounded-full bg-blue-600 px-3 py-1.5 text-xs font-semibold text-white">
                  <Radio className="h-3.5 w-3.5" /> Start a Space
                </span>
                <InitialsAvatar
                  initials="YOU"
                  color={AVATAR_COLORS.blue}
                  className="h-7 w-7 text-[10px]"
                />
              </div>
            </div>

            {/* Three columns */}
            <div className="grid grid-cols-1 gap-4 bg-slate-50 p-4 sm:p-5 lg:grid-cols-[200px_minmax(0,1fr)_220px]">
              {/* Left rail */}
              <aside className="hidden flex-col gap-3 lg:flex">
                <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
                  <div className="h-12 bg-gradient-to-br from-blue-600 to-indigo-600" />
                  <div className="px-3 pb-3">
                    <InitialsAvatar
                      initials="YO"
                      color={AVATAR_COLORS.indigo}
                      className="-mt-6 h-12 w-12 text-sm ring-4 ring-white"
                    />
                    <p className="mt-1.5 text-sm font-bold text-slate-900">
                      Your profile
                    </p>
                    <p className="text-[11px] text-slate-400">@you</p>
                  </div>
                </div>
                <nav className="flex flex-col gap-0.5 rounded-2xl border border-slate-200 bg-white p-2">
                  <span className="flex items-center gap-2.5 rounded-lg bg-blue-50 px-2.5 py-2 text-xs font-bold text-blue-600">
                    <Newspaper className="h-4 w-4" /> Feed
                  </span>
                  <span className="flex items-center gap-2.5 rounded-lg px-2.5 py-2 text-xs font-medium text-slate-500">
                    <Radio className="h-4 w-4" /> Live Spaces
                  </span>
                  <span className="flex items-center gap-2.5 rounded-lg px-2.5 py-2 text-xs font-medium text-slate-500">
                    <MessageSquareText className="h-4 w-4" /> Messages
                  </span>
                  <span className="flex items-center gap-2.5 rounded-lg px-2.5 py-2 text-xs font-medium text-slate-500">
                    <Bookmark className="h-4 w-4" /> Bookmarks
                  </span>
                </nav>
              </aside>

              {/* Center stream */}
              <div className="flex flex-col gap-4">
                {/* Composer */}
                <div className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-white p-3">
                  <InitialsAvatar
                    initials="YO"
                    color={AVATAR_COLORS.blue}
                    className="h-9 w-9 text-[11px]"
                  />
                  <span className="flex-1 rounded-full bg-slate-100 px-4 py-2 text-xs text-slate-400">
                    Share something with the community…
                  </span>
                  <span className="rounded-full bg-blue-600 px-3.5 py-1.5 text-xs font-semibold text-white">
                    Post
                  </span>
                </div>

                {/* Live space card */}
                <article className="rounded-2xl border border-blue-100 bg-blue-50/50 p-4 ring-1 ring-blue-50">
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-white px-2.5 py-1 text-[11px] font-bold text-rose-600 shadow-sm">
                    <PingDot className="h-1.5 w-1.5" /> Live space
                  </span>
                  <div className="mt-3 flex items-center gap-2.5">
                    <InitialsAvatar
                      initials="DS"
                      color={AVATAR_COLORS.indigo}
                      className="h-10 w-10 text-xs"
                    />
                    <div className="leading-tight">
                      <p className="text-sm font-bold text-slate-900">
                        Diego Santos{' '}
                        <span className="ml-1 rounded-full bg-blue-50 px-1.5 py-0.5 text-[9px] font-bold text-blue-600 uppercase">
                          Host
                        </span>
                      </p>
                      <p className="text-[11px] text-slate-400">
                        2 minutes ago
                      </p>
                    </div>
                  </div>
                  <h4 className="mt-3 text-base font-bold tracking-tight text-slate-900">
                    Rust vs Go for infra tooling
                  </h4>
                  <p className="mt-1 text-sm text-slate-600">
                    Come argue about borrow checkers and goroutines. Mics open
                    in 5.
                  </p>
                  <Waveform
                    bars={30}
                    className="mt-3 h-8 gap-[2px] overflow-hidden rounded-lg bg-white/70 px-3"
                  />
                </article>

                {/* Text post */}
                <article className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
                  <div className="p-4">
                    <div className="flex items-center gap-2.5">
                      <InitialsAvatar
                        initials="PS"
                        color={AVATAR_COLORS.slate}
                        className="h-10 w-10 text-xs"
                      />
                      <div className="leading-tight">
                        <p className="text-sm font-bold text-slate-900">
                          Priya Sharma{' '}
                          <span className="ml-1 rounded-full bg-slate-100 px-1.5 py-0.5 text-[9px] font-bold text-slate-500 uppercase">
                            Author
                          </span>
                        </p>
                        <p className="text-[11px] text-slate-400">1 hour ago</p>
                      </div>
                    </div>
                    <h4 className="mt-3 text-base font-bold tracking-tight text-slate-900">
                      Token naming is the hardest part of a design system
                    </h4>
                    <p className="mt-1 text-sm leading-relaxed text-slate-600">
                      Hot take after 4 rebrands: semantic tokens beat literal
                      ones every time. Here's the taxonomy that finally stuck
                      for our team…
                    </p>
                  </div>
                  <div className="flex items-center gap-1 border-t border-slate-100 bg-slate-50/60 px-2 py-1.5">
                    <span className="inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium text-slate-500">
                      <ThumbsUp className="h-4 w-4" /> Like
                    </span>
                    <span className="inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium text-slate-500">
                      <MessageCircle className="h-4 w-4" /> Comment
                    </span>
                    <span className="inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium text-slate-500">
                      <Share2 className="h-4 w-4" /> Share
                    </span>
                  </div>
                </article>
              </div>

              {/* Right rail */}
              <aside className="hidden flex-col gap-3 lg:flex">
                <div className="rounded-2xl border border-slate-200 bg-white p-3">
                  <p className="flex items-center gap-1.5 text-xs font-bold text-slate-900">
                    <Radio className="h-3.5 w-3.5 text-blue-600" /> Live now
                  </p>
                  <div className="mt-2 flex flex-col gap-1">
                    <div className="flex items-center gap-2 rounded-xl p-1.5">
                      <InitialsAvatar
                        initials="FK"
                        color={AVATAR_COLORS.blue}
                        className="h-8 w-8 text-[10px]"
                      />
                      <div className="min-w-0 flex-1 leading-tight">
                        <p className="truncate text-xs font-bold text-slate-900">
                          Distributed systems
                        </p>
                        <p className="truncate text-[10px] text-slate-400">
                          Felix · Live
                        </p>
                      </div>
                      <span className="rounded-full bg-emerald-600 px-2 py-0.5 text-[10px] font-bold text-white">
                        Join
                      </span>
                    </div>
                    <div className="flex items-center gap-2 rounded-xl p-1.5">
                      <InitialsAvatar
                        initials="MP"
                        color={AVATAR_COLORS.indigo}
                        className="h-8 w-8 text-[10px]"
                      />
                      <div className="min-w-0 flex-1 leading-tight">
                        <p className="truncate text-xs font-bold text-slate-900">
                          Scaling Postgres
                        </p>
                        <p className="truncate text-[10px] text-slate-400">
                          Maya · Live
                        </p>
                      </div>
                      <span className="rounded-full bg-emerald-600 px-2 py-0.5 text-[10px] font-bold text-white">
                        Join
                      </span>
                    </div>
                  </div>
                </div>
                <div className="rounded-2xl border border-slate-200 bg-white p-3">
                  <p className="flex items-center gap-1.5 text-xs font-bold text-slate-900">
                    <TrendingUp className="h-3.5 w-3.5 text-blue-600" />{' '}
                    Trending
                  </p>
                  <div className="mt-2 flex flex-col gap-1.5 font-mono text-[11px] text-slate-500">
                    <span>1 · #design-systems</span>
                    <span>2 · #rust</span>
                    <span>3 · #postgres</span>
                  </div>
                </div>
              </aside>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  )
}
