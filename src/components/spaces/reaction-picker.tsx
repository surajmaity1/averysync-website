import { SmilePlus } from 'lucide-react'
import {
  DropDownMenu,
  DropDownMenuContent,
  DropDownMenuItem,
  DropDownMenuPortal,
  DropDownMenuTrigger,
} from '../ui/dropdown-menu'

// Curated grid, WhatsApp/Slack-style. A full native emoji picker would need a
// dependency (e.g. emoji-picker-react) — swap in here if ever wanted.
const REACTION_EMOJIS = [
  '👍',
  '👎',
  '❤️',
  '😂',
  '😮',
  '😢',
  '😡',
  '🎉',
  '👏',
  '🔥',
  '💯',
  '🙌',
  '🤔',
  '😍',
  '🤣',
  '😅',
  '🫡',
  '🤯',
  '😴',
  '🥳',
  '💪',
  '🙏',
  '✨',
  '🚀',
  '👀',
  '💙',
  '🤝',
  '😎',
  '🤗',
  '😇',
  '🍿',
  '⚡',
]

type ReactionPickerProps = {
  onReact: (emoji: string) => void
}

/** "Reacts" section — one trigger button that pops up the emoji grid. */
export const ReactionPicker = ({ onReact }: ReactionPickerProps) => (
  <div className="rounded-lg border border-gray-200 bg-white p-3">
    <div className="flex items-center justify-between">
      <span className="text-xs font-medium text-gray-500">Reacts</span>
      <DropDownMenu>
        <DropDownMenuTrigger
          className="flex cursor-pointer items-center gap-1.5 rounded-full border border-gray-200 bg-gray-50 px-3 py-1.5 text-sm font-medium text-gray-700 outline-none hover:bg-gray-100 focus-visible:ring-2 focus-visible:ring-blue-400"
          aria-label="React with an emoji"
        >
          <SmilePlus className="h-4 w-4" />
          React
        </DropDownMenuTrigger>
        <DropDownMenuPortal>
          <DropDownMenuContent
            sideOffset={6}
            align="end"
            className="z-50 grid max-w-72 grid-cols-8 gap-0.5 rounded-lg border border-gray-200 bg-white p-2 shadow-md"
          >
            {REACTION_EMOJIS.map((emoji) => (
              <DropDownMenuItem
                key={emoji}
                className="flex cursor-pointer items-center justify-center rounded p-1 text-lg outline-none hover:bg-gray-100 focus:bg-gray-100"
                onSelect={() => onReact(emoji)}
                aria-label={`React with ${emoji}`}
              >
                {emoji}
              </DropDownMenuItem>
            ))}
          </DropDownMenuContent>
        </DropDownMenuPortal>
      </DropDownMenu>
    </div>
  </div>
)
