import { SignInButton } from '@/components/buttons/signin-button'
import { BrandLogo } from '@/components/ui/brand-logo'

export function Navbar() {
  return (
    <nav className="bg-white/80">
      <div className="flex h-16 items-center justify-between px-16">
        <a href="/" className="flex items-center gap-2.5">
          <BrandLogo
            size={32}
            withWordmark
            wordmarkClassName="text-2xl font-light"
          />
        </a>
        <SignInButton />
      </div>
    </nav>
  )
}
