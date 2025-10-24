import { Link } from '@tanstack/react-router'
import { HomeIcon, MessageSquareText } from 'lucide-react'
import { Button } from '../ui/button'

export const BottomNavbar = () => {
  return (
    <div className="fixed bottom-4 left-1/2 flex w-full -translate-x-1/2 justify-around gap-6">
      <Link to="/feed">
        <Button className="flex h-12 w-50 items-center justify-center bg-white shadow-md">
          <HomeIcon />
        </Button>
      </Link>
      <Link to="/chat">
        <Button
          // onClick={() => alert('Feature coming soon!')}
          className="flex h-12 w-50 items-center justify-center bg-white shadow-md"
        >
          <MessageSquareText />
        </Button>
      </Link>
    </div>
  )
}
