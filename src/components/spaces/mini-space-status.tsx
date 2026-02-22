import { cn } from '@/libs/utils'
import { Mic } from 'lucide-react'

type SpaceProps = {
  background: string
  label: string
}

const SpaceInformation: Record<number, SpaceProps> = {
  1: { background: 'bg-blue-300', label: 'Upcoming Space' },
  2: { background: 'bg-green-400 animate-pulse', label: 'Live Space' },
  3: { background: 'bg-gray-300', label: 'Past Space' },
  4: { background: 'bg-gray-300', label: 'Cancelled Space' },
}

type MiniSpaceStatusViewProps = {
  choice: number | undefined
}

export const MiniSpaceStatusView = ({ choice }: MiniSpaceStatusViewProps) => {
  if (!choice) return

  const spaceStatus = SpaceInformation[choice]

  return (
    <div className="px-4 pt-4">
      <span
        className={cn(
          'inline-flex items-center space-x-1 rounded-full px-3 py-1 text-xs font-semibold text-white',
          spaceStatus.background,
        )}
      >
        <Mic /> {spaceStatus.label}
      </span>
    </div>
  )
}
