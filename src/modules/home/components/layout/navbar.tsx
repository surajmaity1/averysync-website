// src/components/home/Navbar.tsx
import { SignInButton } from '@/components/buttons/signin-button'
import { Cpu, Menu, X } from 'lucide-react'
import React, { useState } from 'react'
import { NAV_LINKS } from '../data/data'

export const Navbar: React.FC = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState<boolean>(false)

  return (
    <nav className="fixed z-50 w-full border-b border-slate-200 bg-white/80 backdrop-blur-lg">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <div className="flex cursor-pointer items-center gap-2">
            <div className="rounded-lg bg-blue-600 p-1.5">
              <Cpu className="h-5 w-5 text-white" />
            </div>
            <span className="text-xl font-bold tracking-tight text-slate-900">
              Averysync
            </span>
          </div>

          {/* Desktop Links */}
          <div className="hidden items-center gap-8 md:flex">
            {NAV_LINKS.map((link) => (
              <a
                key={link.label}
                href={link.href}
                className="text-sm font-medium text-slate-600 transition-colors hover:text-blue-600"
              >
                {link.label}
              </a>
            ))}
          </div>

          <div className="hidden items-center gap-4 md:flex">
            <SignInButton />
          </div>

          {/* Mobile Toggle */}
          <div className="md:hidden">
            <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
              {mobileMenuOpen ? (
                <X className="text-slate-600" />
              ) : (
                <Menu className="text-slate-600" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="space-y-4 border-b border-slate-200 bg-white p-4 md:hidden">
          {NAV_LINKS.map((link) => (
            <a
              key={link.label}
              href={link.href}
              className="block font-medium text-slate-600"
            >
              {link.label}
            </a>
          ))}
          <div className="flex flex-col items-center gap-3 border-t border-slate-100 pt-4">
            <SignInButton />
          </div>
        </div>
      )}
    </nav>
  )
}
