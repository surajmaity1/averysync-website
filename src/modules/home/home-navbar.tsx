import { SignInButton } from '@/components/buttons/signin-button'
import AverysyncLogo from '@/components/common/averysync-logo'

export function Navbar() {
  return (
    <nav className="bg-white/80">
      <div className="flex h-16 items-center justify-between px-16">
        <AverysyncLogo />
        <SignInButton />
      </div>
    </nav>
  )
}
