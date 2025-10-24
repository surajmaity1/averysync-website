import { Link } from '@tanstack/react-router'
import { HomeIcon, MessageSquareText } from 'lucide-react'
import { Button } from '../ui/button'

export const BottomNavbar = () => {
  return (
    <div className="fixed right-0 bottom-0 left-0 flex w-full justify-center">
      <Link to="/feed">
        <Button className="h-12 w-50 items-center justify-center bg-white shadow-md">
          <HomeIcon />
        </Button>
      </Link>
      <Link to="/chat">
        <Button
          // onClick={() => alert('Feature coming soon!')}
          className="h-12 w-50 items-center justify-center bg-white shadow-md"
        >
          <MessageSquareText />
        </Button>
      </Link>
    </div>
  )
}
