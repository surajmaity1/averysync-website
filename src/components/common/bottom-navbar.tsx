import { Link } from '@tanstack/react-router'
import { Bell, HomeIcon, MessageSquareText, Sparkles } from 'lucide-react'
import { Button } from '../ui/button'

export const BottomNavbar = () => {
  return (
    <nav
      aria-label="Primary"
      className="fixed right-0 bottom-0 left-0 z-50 flex w-full items-center justify-between border-t border-gray-200 bg-white shadow-md md:hidden"
    >
      <div className="flex w-full justify-around">
        <Link
          to="/feed"
          aria-label="Home"
          className="flex flex-1 items-center justify-center"
        >
          <Button variant="bottomNavbar" size="bottomNavbar">
            <HomeIcon />
          </Button>
        </Link>

        <Link
          to="/notifications"
          aria-label="Notifications"
          className="flex flex-1 items-center justify-center"
        >
          <Button variant="bottomNavbar" size="bottomNavbar">
            <Bell />
          </Button>
        </Link>

        <Link
          to="/ai/chat"
          aria-label="AI assistant"
          className="flex flex-1 items-center justify-center"
        >
          <Button variant="bottomNavbar" size="bottomNavbar">
            <Sparkles />
          </Button>
        </Link>

        <Link
          to="/chat"
          aria-label="Messages"
          className="flex flex-1 items-center justify-center"
        >
          <Button variant="bottomNavbar" size="bottomNavbar">
            <MessageSquareText />
          </Button>
        </Link>
      </div>
    </nav>
  )
}
