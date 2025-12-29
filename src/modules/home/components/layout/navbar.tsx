// src/components/home/Navbar.tsx
import { SignInButton } from '@/components/buttons/signin-button'
import { ChevronRight, Menu, X } from 'lucide-react'
import React, { useEffect, useState } from 'react'
import { NAV_LINKS } from '../data/data'

export const Navbar: React.FC = () => {
  const [isScrolled, setIsScrolled] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10)
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  return (
    <header
      className={`fixed inset-x-0 top-0 z-50 transition-all duration-300 ease-in-out ${
        isScrolled || mobileMenuOpen
          ? 'bg-white/80 py-3 shadow-sm backdrop-blur-md'
          : 'bg-transparent py-6'
      }`}
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <div className="group flex cursor-pointer items-center gap-2.5">
            <div className="relative flex h-10 w-10 items-center justify-center rounded-xl bg-white shadow-lg ring-1 shadow-slate-200/20 ring-slate-900/5 transition-all duration-300 group-hover:scale-105 group-hover:rotate-3 group-hover:shadow-slate-200/30">
              <img
                src="/favicon.ico"
                alt="Averysync Logo"
                className="h-6 w-6 transition-transform duration-500 group-hover:rotate-180"
              />
            </div>
            <span className="text-lg font-bold tracking-tight text-slate-900 transition-colors group-hover:text-blue-600">
              Averysync
            </span>
          </div>

          {/* Desktop Navigation - Floating Pill */}
          <nav className="hidden items-center gap-1 rounded-full border border-slate-200/60 bg-white/60 p-1.5 px-2 shadow-sm backdrop-blur-md transition-all hover:border-slate-300/80 hover:bg-white/80 hover:shadow-md md:flex">
            {NAV_LINKS.map((link) => (
              <a
                key={link.label}
                href={link.href}
                className="relative rounded-full px-4 py-1.5 text-sm font-medium text-slate-600 transition-all hover:bg-slate-100 hover:text-slate-900"
              >
                {link.label}
              </a>
            ))}
          </nav>

          {/* Right Actions */}
          <div className="flex items-center gap-4">
            <SignInButton />
            {/* Mobile Toggle */}
            <div className="md:hidden">
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="group relative z-50 rounded-xl bg-white/50 p-2 transition-colors hover:bg-slate-100"
              >
                <div className="relative h-6 w-6 transition-all duration-300">
                  <Menu
                    className={`absolute inset-0 h-6 w-6 text-slate-600 transition-all duration-300 ${
                      mobileMenuOpen
                        ? 'rotate-90 opacity-0'
                        : 'rotate-0 opacity-100'
                    }`}
                  />
                  <X
                    className={`absolute inset-0 h-6 w-6 text-slate-600 transition-all duration-300 ${
                      mobileMenuOpen
                        ? 'rotate-0 opacity-100'
                        : '-rotate-90 opacity-0'
                    }`}
                  />
                </div>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Menu Overlay */}
      <div
        className={`absolute inset-x-0 top-full border-b border-slate-200 bg-white/95 px-4 pt-2 pb-6 shadow-xl backdrop-blur-xl transition-all duration-300 md:hidden ${
          mobileMenuOpen
            ? 'visible translate-y-0 opacity-100'
            : 'invisible -translate-y-4 opacity-0'
        }`}
      >
        <div className="flex flex-col space-y-2">
          {NAV_LINKS.map((link) => (
            <a
              key={link.label}
              href={link.href}
              className="group flex items-center justify-between rounded-xl p-4 text-base font-medium text-slate-600 transition-all hover:bg-slate-50 hover:pl-5 hover:text-blue-600"
            >
              {link.label}
              <ChevronRight className="h-4 w-4 opacity-0 transition-all group-hover:opacity-100" />
            </a>
          ))}
        </div>
      </div>
    </header>
  )
}
