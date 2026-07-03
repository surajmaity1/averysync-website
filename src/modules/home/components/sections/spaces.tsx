import {
  ArrowUpRight,
  Bell,
  Calendar,
  CalendarClock,
  Headphones,
} from 'lucide-react'
import React from 'react'
import { useHomeCta } from '../../hooks/use-home-cta'
import { SPACES, type Space } from '../data/data'
import { Eyebrow } from '../ui/eyebrow'
import { InitialsAvatar } from '../ui/initials-avatar'
import { LiveCount } from '../ui/live-count'
import { PingDot } from '../ui/ping-dot'
import { Reveal } from '../ui/reveal'
import { Waveform } from '../ui/waveform'

const LiveBadge: React.FC = () => (
  <span className="inline-flex items-center gap-1.5 rounded-full bg-white px-2.5 py-1 text-[11px] font-bold text-rose-600 shadow-sm">
    <PingDot />
    LIVE
  </span>
)

const SpaceCard: React.FC<{ space: Space; onJoin: () => void }> = ({
  space,
  onJoin,
}) => {
  const isLive = space.status === 'live'

  return (
    <article
      className={
        isLive
          ? 'group hover:shadow-card relative flex h-full flex-col rounded-3xl border border-blue-100 bg-blue-50/40 p-5 ring-1 ring-blue-50 transition-all duration-300 hover:-translate-y-1'
          : 'group hover:shadow-card relative flex h-full flex-col rounded-3xl border border-slate-200 bg-white p-5 transition-all duration-300 hover:-translate-y-1'
      }
    >
      <div className="flex items-center justify-between">
        {isLive ? (
          <>
            <LiveBadge />
            <span className="font-mono text-[11px] text-slate-400">
              {space.elapsed}
            </span>
          </>
        ) : (
          <>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-blue-50 px-2.5 py-1 text-[11px] font-bold text-blue-600">
              <CalendarClock className="h-3.5 w-3.5" /> {space.startsIn}
            </span>
            <Bell className="h-4 w-4 text-slate-300" />
          </>
        )}
      </div>

      <h3 className="mt-4 text-lg leading-snug font-bold tracking-tight text-slate-900">
        {space.title}
      </h3>
      <div className="mt-2 flex gap-1.5">
        {space.tags.map((tag) => (
          <span
            key={tag}
            className={
              isLive
                ? 'rounded-md bg-white px-2 py-0.5 font-mono text-[11px] text-slate-500'
                : 'rounded-md bg-slate-100 px-2 py-0.5 font-mono text-[11px] text-slate-500'
            }
          >
            {tag}
          </span>
        ))}
      </div>

      {isLive ? (
        <Waveform
          bars={34}
          className="mt-4 h-9 gap-[2px] overflow-hidden rounded-xl bg-white/70 px-3"
        />
      ) : (
        <div className="mt-4 flex h-9 items-center gap-1 rounded-xl bg-slate-50 px-3 text-xs text-slate-400">
          <Calendar className="h-3.5 w-3.5" /> {space.schedule}
        </div>
      )}

      <div
        className={
          isLive
            ? 'mt-4 flex items-center justify-between border-t border-blue-100/70 pt-4'
            : 'mt-4 flex items-center justify-between border-t border-slate-100 pt-4'
        }
      >
        <div className="flex items-center gap-2.5">
          <InitialsAvatar
            initials={space.host.initials}
            color={space.host.color}
            className="h-9 w-9 text-xs"
            speaking={isLive}
          />
          <div className="leading-tight">
            <p className="text-sm font-bold text-slate-900">
              {space.host.name}
            </p>
            <p className="text-xs text-slate-500">{space.host.role}</p>
          </div>
        </div>
        {isLive ? (
          <div className="flex items-center gap-1.5 text-slate-500">
            <Headphones className="h-4 w-4" />
            <LiveCount
              initial={space.listeners}
              className="text-sm font-semibold text-slate-700"
            />
          </div>
        ) : (
          <button
            type="button"
            onClick={onJoin}
            className="rounded-full bg-slate-900 px-3.5 py-1.5 text-xs font-bold text-white transition-colors hover:bg-slate-800"
          >
            Remind me
          </button>
        )}
      </div>
    </article>
  )
}

export const Spaces: React.FC = () => {
  const { startSpace } = useHomeCta()

  return (
    <section id="spaces" className="py-24 lg:py-28">
      <div className="mx-auto max-w-[1200px] px-5 sm:px-6 lg:px-8">
        <Reveal className="flex flex-col justify-between gap-6 md:flex-row md:items-end">
          <div className="max-w-2xl">
            <div className="flex items-center gap-2.5">
              <PingDot className="h-2.5 w-2.5" />
              <Eyebrow className="text-slate-500">
                Happening now ·{' '}
                <LiveCount
                  initial={47}
                  className="font-semibold text-rose-600"
                />{' '}
                live
              </Eyebrow>
            </div>
            <h2 className="tracking-tightest mt-4 text-3xl font-bold text-slate-900 sm:text-4xl">
              Rooms open at this moment
            </h2>
            <p className="mt-3 text-lg text-slate-600">
              Real conversations, happening live. Pull up a chair or take the
              mic.
            </p>
          </div>
          <button
            type="button"
            onClick={startSpace}
            className="group inline-flex w-fit items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 transition-all hover:border-blue-200 hover:bg-blue-50 hover:text-blue-700"
          >
            Browse all Spaces
            <ArrowUpRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
          </button>
        </Reveal>

        <div className="mt-12 grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
          {SPACES.map((space, i) => (
            <Reveal key={space.title} delay={i * 0.08}>
              <SpaceCard space={space} onJoin={startSpace} />
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  )
}
