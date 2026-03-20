import { cn } from '@/libs/utils'
import { Edit3, Link as LinkIcon, MoreHorizontal, Trash2 } from 'lucide-react'
import React, { useEffect, useRef, useState } from 'react'

type MenuItemProps = {
  icon: React.ElementType
  label: string
  onClick: () => void
  variant?: 'default' | 'danger'
}

const MenuItem = ({
  icon: Icon,
  label,
  onClick,
  variant = 'default',
}: MenuItemProps) => (
  <button
    type="button"
    onClick={(e) => {
      e.stopPropagation()
      onClick()
    }}
    className={cn(
      'flex w-full items-center gap-2 px-4 py-2.5 text-sm transition-colors first:rounded-t-lg last:rounded-b-lg',
      variant === 'danger'
        ? 'text-red-600 hover:bg-red-50'
        : 'text-gray-700 hover:bg-gray-50',
    )}
  >
    <Icon size={16} />
    <span className="font-medium">{label}</span>
  </button>
)

type PostOptionsMenuProps = {
  onEdit: () => void
  onDelete: () => void
  onShare: () => void
  manage: boolean
}

export const PostOptionsMenu = ({
  onEdit,
  onDelete,
  onShare,
  manage,
}: PostOptionsMenuProps) => {
  const [isOpen, setIsOpen] = useState<boolean>(false)
  const menuRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside)
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isOpen])

  const toggleMenu = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation()
    setIsOpen((prev) => !prev)
  }

  return (
    <div className="relative ml-auto" ref={menuRef}>
      <button
        type="button"
        onClick={toggleMenu}
        aria-label="Post options"
        className={cn(
          'flex h-8 w-8 cursor-pointer items-center justify-center rounded-full text-blue-400 transition-colors hover:bg-blue-200 hover:text-gray-900',
          isOpen && 'bg-blue-200 text-blue-500',
        )}
      >
        <MoreHorizontal size={20} />
      </button>

      {isOpen && (
        <div className="animate-in fade-in zoom-in-95 absolute top-full right-0 z-10 mt-1 w-40 origin-top-right transform rounded-lg border border-gray-100 bg-white shadow-xl ring-1 ring-black/5">
          <div className="flex flex-col py-1">
            {manage === true && (
              <MenuItem
                icon={Edit3}
                label="Edit"
                onClick={() => {
                  setIsOpen(false)
                  onEdit()
                }}
              />
            )}

            <MenuItem
              icon={LinkIcon}
              label="Share"
              onClick={() => {
                setIsOpen(false)
                onShare()
              }}
            />

            {manage && (
              <>
                <div className="my-1 h-px bg-gray-100" role="none" />
                <MenuItem
                  icon={Trash2}
                  label="Delete"
                  onClick={() => {
                    setIsOpen(false)
                    onDelete()
                  }}
                  variant="danger"
                />
              </>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
