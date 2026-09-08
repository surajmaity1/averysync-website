import { GoogleIcon } from '@/components/icons/signin-button-icons'
import { cn } from '@/libs/utils'
import { ArrowUpRight, Menu, X } from 'lucide-react'
import React, { useEffect, useRef, useState } from 'react'
import { useHomeCta } from '../../hooks/use-home-cta'
import { NAV_LINKS } from '../data/data'
import { BrandMark } from '../ui/brand-mark'

export const Navbar: React.FC = () => {
  const [isScrolled, setIsScrolled] = useState(false)
  const [isVisible, setIsVisible] = useState(true)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const lastScrollY = useRef(0)
  const { isLoggedIn, isLoading, startSpace } = useHomeCta()

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY
      setIsScrolled(currentScrollY > 12)
      setIsVisible(
        currentScrollY <= lastScrollY.current || currentScrollY <= 140,
      )
      lastScrollY.current = currentScrollY
    }
    window.addEventListener('scroll', handleScroll, { passive: true })
    handleScroll()
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const closeMenuAnd = (action?: () => void) => () => {
    setMobileMenuOpen(false)
    action?.()
  }

  const signInLabel = isLoggedIn ? 'Open Feed' : 'Sign in'

  return (
    <header
      className={cn(
        'fixed inset-x-0 top-0 z-50 transition-all duration-500 ease-out',
        isVisible || mobileMenuOpen ? 'translate-y-0' : '-translate-y-[120%]',
      )}
    >
      <div className="mx-auto max-w-[1200px] px-5 sm:px-6 lg:px-8">
        <div
          className={cn(
            'mt-4 flex items-center justify-between rounded-2xl border px-4 py-2.5 transition-all duration-500',
            isScrolled || mobileMenuOpen
              ? 'shadow-soft border-slate-200/70 bg-white/80 backdrop-blur-xl'
              : 'border-transparent',
          )}
        >
          <a href="#top" className="group flex items-center gap-2.5">
            <BrandMark className="shadow-sm shadow-blue-600/25" />
            <span className="tracking-tightest text-[17px] font-bold text-slate-900 max-[359px]:hidden">
              Averysync
            </span>
          </a>

          <nav className="hidden items-center gap-1 md:flex">
            {NAV_LINKS.map((link) => (
              <a
                key={link.label}
                href={link.href}
                className="rounded-lg px-3.5 py-2 text-sm font-medium text-slate-600 transition-colors hover:text-slate-900"
              >
                {link.label}
              </a>
            ))}
          </nav>

          <div className="flex items-center gap-2">
            {!isLoading && (
              <button
                type="button"
                onClick={startSpace}
                className="hidden items-center gap-2 rounded-lg px-3.5 py-2 text-sm font-semibold text-slate-700 transition-colors hover:text-slate-900 sm:inline-flex"
              >
                {!isLoggedIn && <GoogleIcon />}
                {signInLabel}
              </button>
            )}
            <button
              type="button"
              onClick={startSpace}
              className="group inline-flex items-center gap-1.5 rounded-lg bg-slate-900 px-3 py-2 text-sm font-semibold whitespace-nowrap text-white transition-all hover:bg-slate-800 sm:px-4"
            >
              Start a Space
              <ArrowUpRight className="hidden h-4 w-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5 sm:block" />
            </button>
            <button
              type="button"
              onClick={() => setMobileMenuOpen((open) => !open)}
              className="ml-1 inline-flex h-9 w-9 items-center justify-center rounded-lg text-slate-700 transition-colors hover:bg-slate-100 md:hidden"
              aria-label="Menu"
              aria-expanded={mobileMenuOpen}
            >
              {mobileMenuOpen ? (
                <X className="h-5 w-5" />
              ) : (
                <Menu className="h-5 w-5" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      <div
        className={cn(
          'shadow-soft mx-5 mt-2 overflow-hidden rounded-2xl border border-slate-200 bg-white/95 p-2 backdrop-blur-xl md:hidden',
          mobileMenuOpen ? 'block' : 'hidden',
        )}
      >
        {NAV_LINKS.map((link) => (
          <a
            key={link.label}
            href={link.href}
            onClick={closeMenuAnd()}
            className="block rounded-xl px-4 py-3 text-sm font-medium text-slate-700 hover:bg-slate-50"
          >
            {link.label}
          </a>
        ))}
        <button
          type="button"
          onClick={closeMenuAnd(startSpace)}
          className="mt-1 flex w-full items-center gap-2 rounded-xl px-4 py-3 text-sm font-semibold text-slate-900 hover:bg-slate-50"
        >
          {!isLoggedIn && <GoogleIcon />}
          {signInLabel}
        </button>
      </div>
    </header>
  )
}
