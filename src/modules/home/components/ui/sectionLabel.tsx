import React from 'react'

interface SectionLabelProps {
  children: React.ReactNode
}

export const SectionLabel: React.FC<SectionLabelProps> = ({ children }) => (
  <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-blue-100 bg-blue-50 px-3 py-1 text-xs font-bold tracking-wider text-blue-700 uppercase">
    {children}
  </div>
)
