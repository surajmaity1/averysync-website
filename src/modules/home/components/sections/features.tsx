import React from 'react'
import { Feature, FEATURES } from '../data/data'
import { SectionLabel } from '../ui/sectionLabel'

const FeatureCard: React.FC<Feature> = ({ title, description, icon }) => (
  <div className="group rounded-2xl border border-slate-100 bg-white p-8 transition-all duration-300 hover:border-blue-100 hover:shadow-xl hover:shadow-blue-500/5">
    <div className="mb-6 flex h-12 w-12 items-center justify-center rounded-xl bg-blue-50 transition-transform duration-300 group-hover:scale-110">
      {/* Since icon is ReactNode, we just render it directly */}
      {icon}
    </div>
    <h3 className="mb-3 text-xl font-bold text-slate-900">{title}</h3>
    <p className="leading-relaxed text-slate-600">{description}</p>
  </div>
)

export const Features: React.FC = () => {
  return (
    <section id="features" className="bg-slate-50 py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto mb-16 max-w-3xl text-center">
          <SectionLabel>Capabilities</SectionLabel>
          <h2 className="mb-4 text-3xl font-bold text-slate-900 sm:text-4xl">
            Where voice meets opportunity
          </h2>
          <p className="text-lg text-slate-600">
            A platform designed to humanize the tech industry. Speak, listen,
            and build your professional reputation.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-2">
          {FEATURES.map((feature, index) => (
            <FeatureCard key={index} {...feature} />
          ))}
        </div>
      </div>
    </section>
  )
}
