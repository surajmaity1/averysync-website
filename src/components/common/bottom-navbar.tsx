import { Link } from '@tanstack/react-router'
import { HomeIcon, MessageSquareText } from 'lucide-react'
import { Button } from '../ui/button'

export const BottomNavbar = () => {
  return (
    <div className="fixed right-0 bottom-0 left-0 flex w-full justify-center">
      <Link to="/feed">
        <Button variant="bottomNavbar" size="bottomNavbar">
          <HomeIcon />
        </Button>
      </Link>
      <Link to="/chat">
        <Button variant="bottomNavbar" size="bottomNavbar">
          <MessageSquareText />
        </Button>
      </Link>
    </div>
  )
}
