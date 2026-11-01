import { AvatarUser } from '@/components/ui/avatar'
import {
  DropDownMenu,
  DropDownMenuContent,
  DropDownMenuItem,
  DropDownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { cn } from '@/libs/utils'
import { TUser } from '@/api/users/users.type'
import { Link } from '@tanstack/react-router'
import {
  MessageSquarePlus,
  MoreHorizontal,
  PanelLeftClose,
  Pencil,
  Search,
  Sparkles,
  Trash2,
} from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import type { AiConversation } from '../ai-chat.types'
import {
  filterConversations,
  groupConversationsByRecency,
} from '../ai-chat.utils'

type AiSidebarProps = {
  conversations: AiConversation[]
  activeId: string | null
  query: string
  onQueryChange: (value: string) => void
  onSelect: (id: string) => void
  onNewChat: () => void
  onRename: (id: string, title: string) => void
  onDelete: (id: string) => void
  /** Collapse (desktop) or dismiss (mobile drawer) the sidebar. */
  onClose: () => void
  user: TUser
  className?: string
}

/** One recents row: select on click, rename inline, delete via the row menu. */
const ConversationRow = ({
  conversation,
  active,
  onSelect,
  onRename,
  onDelete,
}: {
  conversation: AiConversation
  active: boolean
  onSelect: () => void
  onRename: (title: string) => void
  onDelete: () => void
}) => {
  const [renaming, setRenaming] = useState(false)
  const [titleDraft, setTitleDraft] = useState(conversation.title)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (renaming) inputRef.current?.select()
  }, [renaming])

  const commitRename = () => {
    onRename(titleDraft)
    setRenaming(false)
  }

  if (renaming) {
    return (
      <div className="px-1">
        <input
          ref={inputRef}
          value={titleDraft}
          onChange={(e) => setTitleDraft(e.target.value)}
          onBlur={commitRename}
          onKeyDown={(e) => {
            if (e.key === 'Enter') commitRename()
            if (e.key === 'Escape') {
              setTitleDraft(conversation.title)
              setRenaming(false)
            }
          }}
          aria-label={`Rename ${conversation.title}`}
          className="w-full rounded-lg border border-blue-200 bg-white px-2.5 py-1.5 text-sm text-slate-900 outline-none focus:ring-1 focus:ring-blue-200"
        />
      </div>
    )
  }

  return (
    <div
      className={cn(
        'group relative flex items-center rounded-xl transition-colors',
        active ? 'bg-blue-50' : 'hover:bg-slate-100',
      )}
    >
      <button
        type="button"
        onClick={onSelect}
        aria-current={active ? 'true' : undefined}
        className={cn(
          'min-w-0 flex-1 truncate px-3 py-2 text-left text-sm',
          active ? 'font-semibold text-blue-700' : 'text-slate-700',
        )}
      >
        {conversation.title}
      </button>

      <DropDownMenu>
        <DropDownMenuTrigger asChild>
          <button
            type="button"
            aria-label={`Options for ${conversation.title}`}
            className="mr-1 flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-lg text-slate-400 opacity-0 transition-opacity group-hover:opacity-100 hover:bg-slate-200 hover:text-slate-700 focus:opacity-100 data-[state=open]:opacity-100"
          >
            <MoreHorizontal className="h-4 w-4" />
          </button>
        </DropDownMenuTrigger>
        <DropDownMenuContent
          align="end"
          sideOffset={4}
          className="min-w-36 p-1"
        >
          <DropDownMenuItem
            onSelect={() => {
              setTitleDraft(conversation.title)
              setRenaming(true)
            }}
            className="flex cursor-pointer items-center gap-2 rounded-md px-2.5 py-1.5 text-sm text-slate-700 outline-none data-[highlighted]:bg-slate-100"
          >
            <Pencil className="h-3.5 w-3.5" /> Rename
          </DropDownMenuItem>
          <DropDownMenuItem
            onSelect={onDelete}
            className="flex cursor-pointer items-center gap-2 rounded-md px-2.5 py-1.5 text-sm text-red-600 outline-none data-[highlighted]:bg-red-50"
          >
            <Trash2 className="h-3.5 w-3.5" /> Delete
          </DropDownMenuItem>
        </DropDownMenuContent>
      </DropDownMenu>
    </div>
  )
}

/**
 * Left rail: brand, new-chat action, search, recents grouped by recency, and
 * the signed-in user. Rendered as a fixed column on desktop and an overlay
 * drawer on mobile (the parent owns that positioning via `className`).
 */
export const AiSidebar = ({
  conversations,
  activeId,
  query,
  onQueryChange,
  onSelect,
  onNewChat,
  onRename,
  onDelete,
  onClose,
  user,
  className,
}: AiSidebarProps) => {
  const visible = filterConversations(conversations, query)
  const groups = groupConversationsByRecency(visible)

  return (
    <nav
      aria-label="Chat history"
      className={cn(
        'flex h-full w-72 flex-col border-r border-slate-200 bg-slate-50',
        className,
      )}
    >
      {/* Brand + collapse */}
      <div className="flex flex-shrink-0 items-center justify-between px-4 pt-4 pb-2">
        <Link to="/feed" className="flex items-center gap-2">
          <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-blue-600">
            <Sparkles className="h-4 w-4 text-white" />
          </span>
          <span className="text-sm font-bold tracking-tight text-slate-900">
            AverySync AI
          </span>
        </Link>
        <button
          type="button"
          onClick={onClose}
          aria-label="Close sidebar"
          className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-900"
        >
          <PanelLeftClose className="h-4 w-4" />
        </button>
      </div>

      {/* New chat + search */}
      <div className="flex-shrink-0 space-y-2 px-3 py-2">
        <button
          type="button"
          onClick={onNewChat}
          className="flex w-full items-center gap-2 rounded-xl bg-blue-600 px-3 py-2.5 text-sm font-semibold text-white shadow-sm shadow-blue-200 transition-colors hover:bg-blue-700"
        >
          <MessageSquarePlus className="h-4 w-4" /> New chat
        </button>
        <div className="relative">
          <Search className="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            type="search"
            value={query}
            onChange={(e) => onQueryChange(e.target.value)}
            placeholder="Search chats"
            aria-label="Search chats"
            className="h-9 w-full rounded-xl bg-slate-100 pr-3 pl-9 text-sm text-slate-900 transition-colors outline-none placeholder:text-slate-400 focus:bg-white focus:ring-1 focus:ring-blue-200"
          />
        </div>
      </div>

      {/* Recents */}
      <div className="min-h-0 flex-1 space-y-4 overflow-y-auto px-2 py-2">
        {groups.length === 0 && (
          <p className="px-3 py-6 text-center text-sm text-slate-400">
            {query.trim() ? 'No chats match your search.' : 'No chats yet.'}
          </p>
        )}
        {groups.map((group) => (
          <section key={group.label} aria-label={group.label}>
            <h3 className="px-3 pb-1 text-[11px] font-semibold tracking-wide text-slate-400 uppercase">
              {group.label}
            </h3>
            <ul className="space-y-0.5">
              {group.conversations.map((conversation) => (
                <li key={conversation.id}>
                  <ConversationRow
                    conversation={conversation}
                    active={conversation.id === activeId}
                    onSelect={() => onSelect(conversation.id)}
                    onRename={(title) => onRename(conversation.id, title)}
                    onDelete={() => onDelete(conversation.id)}
                  />
                </li>
              ))}
            </ul>
          </section>
        ))}
      </div>

      {/* Signed-in user */}
      <div className="flex flex-shrink-0 items-center gap-3 border-t border-slate-200 px-4 py-3">
        <AvatarUser src={user.image} name={user.name} size={32} />
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-semibold text-slate-900">
            {user.name || 'You'}
          </p>
          <p className="truncate text-xs text-slate-400">Free plan</p>
        </div>
      </div>
    </nav>
  )
}
