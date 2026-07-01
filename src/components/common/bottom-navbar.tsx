import { Link } from '@tanstack/react-router'
import { HomeIcon, MessageSquareText } from 'lucide-react'
import { Button } from '../ui/button'

export const BottomNavbar = () => {
  return (
    <div className="fixed right-0 bottom-0 left-0 z-50 flex w-full items-center justify-between border-t border-gray-200 bg-white shadow-md md:hidden">
      <div className="flex w-full justify-around">
        <Link to="/feed" className="flex flex-1 items-center justify-center">
          <Button variant="bottomNavbar" size="bottomNavbar">
            <HomeIcon />
          </Button>
        </Link>

        <Link to="/chat" className="flex flex-1 items-center justify-center">
          <Button variant="bottomNavbar" size="bottomNavbar">
            <MessageSquareText />
          </Button>
        </Link>
      </div>
    </div>
  )
}
