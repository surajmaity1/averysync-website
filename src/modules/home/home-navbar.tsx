import { SignInButton } from '@/components/buttons/signin-button'
import ArriveSoonLogo from '../../components/Logo'

export function Navbar() {
  return (
    <nav className="bg-white/80">
      <div className="flex h-16 items-center justify-between px-16">
        <ArriveSoonLogo />
        <SignInButton />
      </div>
    </nav>
  )
}
