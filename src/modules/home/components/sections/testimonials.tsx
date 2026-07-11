import { MessageCircle, Star } from 'lucide-react'
import React from 'react'
import {
  FEATURED_TESTIMONIAL,
  STARRED_TESTIMONIAL,
  TESTIMONIALS,
  type Testimonial,
} from '../data/data'
import { Eyebrow } from '../ui/eyebrow'
import { InitialsAvatar } from '../ui/initials-avatar'
import { Reveal } from '../ui/reveal'

const Attribution: React.FC<{ testimonial: Testimonial; dark?: boolean }> = ({
  testimonial,
  dark = false,
}) => (
  <figcaption className="mt-6 flex items-center gap-3">
    <InitialsAvatar
      initials={testimonial.initials}
      color={testimonial.color}
      className="h-10 w-10 text-xs"
    />
    <div>
      <p
        className={
          dark ? 'text-sm font-bold' : 'text-sm font-bold text-slate-900'
        }
      >
        {testimonial.author}
      </p>
      <p className={dark ? 'text-sm text-slate-400' : 'text-xs text-slate-500'}>
        {testimonial.role}
      </p>
    </div>
  </figcaption>
)

export const Testimonials: React.FC = () => {
  return (
    <section id="community" className="py-24 lg:py-28">
      <div className="mx-auto max-w-[1200px] px-5 sm:px-6 lg:px-8">
        <Reveal className="flex flex-col justify-between gap-6 md:flex-row md:items-end">
          <div className="max-w-2xl">
            <Eyebrow className="text-blue-600">Community</Eyebrow>
            <h2 className="mt-4 text-3xl font-bold tracking-tightest text-slate-900 sm:text-4xl">
              Loved by builders worldwide
            </h2>
          </div>
          <a
            href="https://discord.gg/ZhbqDN9fz4"
            target="_blank"
            rel="noopener noreferrer"
            className="group inline-flex w-fit items-center gap-2 rounded-xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white transition-all hover:-translate-y-0.5 hover:bg-slate-800"
          >
            <MessageCircle className="h-4 w-4" /> Join the Discord
          </a>
        </Reveal>

        <div className="mt-12 grid grid-cols-1 gap-5 md:grid-cols-3">
          {/* Featured */}
          <Reveal className="md:col-span-2">
            <figure className="flex h-full flex-col justify-between rounded-3xl border border-slate-200 bg-slate-900 p-8 text-white">
              <blockquote className="text-2xl font-medium leading-snug tracking-tight">
                "{FEATURED_TESTIMONIAL.content}"
              </blockquote>
              <figcaption className="mt-8 flex items-center gap-3">
                <InitialsAvatar
                  initials={FEATURED_TESTIMONIAL.initials}
                  color={FEATURED_TESTIMONIAL.color}
                  className="h-11 w-11 text-sm"
                />
                <div>
                  <p className="text-sm font-bold">
                    {FEATURED_TESTIMONIAL.author}
                  </p>
                  <p className="text-sm text-slate-400">
                    {FEATURED_TESTIMONIAL.role}
                  </p>
                </div>
              </figcaption>
            </figure>
          </Reveal>

          <div className="flex flex-col gap-5">
            <Reveal delay={0.1} className="flex-1">
              <figure className="flex h-full flex-col justify-between rounded-3xl border border-slate-200 bg-white p-6">
                <div>
                  <div className="mb-4 flex gap-0.5 text-amber-400">
                    {Array.from({ length: 5 }, (_, i) => (
                      <Star key={i} className="h-4 w-4 fill-amber-400" />
                    ))}
                  </div>
                  <blockquote className="text-base leading-relaxed text-slate-700">
                    "{STARRED_TESTIMONIAL.content}"
                  </blockquote>
                </div>
                <Attribution testimonial={STARRED_TESTIMONIAL} />
              </figure>
            </Reveal>
          </div>
        </div>

        <div className="mt-5 grid grid-cols-1 gap-5 md:grid-cols-3">
          {TESTIMONIALS.map((testimonial, i) => (
            <Reveal key={testimonial.author} delay={0.05 + i * 0.07}>
              <figure className="h-full rounded-3xl border border-slate-200 bg-white p-6">
                <blockquote className="text-base leading-relaxed text-slate-700">
                  "{testimonial.content}"
                </blockquote>
                <Attribution testimonial={testimonial} />
              </figure>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  )
}
