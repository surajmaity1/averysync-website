import { useAuth } from '@/hooks/useAuth'
import { cn } from '@/libs/utils'
import { useNavigate } from '@tanstack/react-router'
import { FeedTopBar } from '../feed/components/feed-topbar'
import { NotificationList } from './components/notification-list'
import type { AppNotification } from './notifications.types'
import { NOTIFICATION_TABS } from './notifications.utils'
import { useNotifications } from './use-notifications'

export const Notifications = () => {
  const { user } = useAuth()
  const navigate = useNavigate()
  const {
    groups,
    unreadCount,
    activeTab,
    setActiveTab,
    markRead,
    markAllRead,
  } = useNotifications()

  // Opening a notification marks it read and deep-links to the related surface:
  // follows go to the actor's profile, Space activity to the Space's post.
  const openNotification = (notification: AppNotification) => {
    markRead(notification.id)
    if (notification.type === 'follow') {
      navigate({ to: '/$userId', params: { userId: notification.actor.id } })
    } else if (notification.spaceId) {
      navigate({
        to: '/feed/$postId',
        params: { postId: notification.spaceId },
      })
    }
  }

  return (
    <div className="min-h-[100dvh] bg-slate-50">
      <FeedTopBar user={user} onStartSpace={() => navigate({ to: '/feed' })} />

      <main className="mx-auto w-full max-w-[720px] px-0 pb-24 sm:px-4 sm:pb-10 lg:px-6">
        <div className="border-slate-200 bg-white shadow-sm sm:mt-6 sm:rounded-3xl sm:border">
          <header className="flex items-center justify-between gap-3 border-b border-slate-100 px-4 py-4 sm:px-6">
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold tracking-tight text-slate-900">
                Notifications
              </h1>
              {unreadCount > 0 && (
                <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-blue-600 px-1.5 text-[11px] font-bold text-white">
                  {unreadCount}
                </span>
              )}
            </div>
            <button
              type="button"
              onClick={markAllRead}
              disabled={unreadCount === 0}
              className="rounded-full px-3 py-1.5 text-sm font-semibold text-blue-600 transition-colors hover:bg-blue-50 disabled:cursor-not-allowed disabled:text-slate-300 disabled:hover:bg-transparent"
            >
              Mark all as read
            </button>
          </header>

          <div className="px-4 pt-4 sm:px-6">
            <div
              role="tablist"
              aria-label="Filter notifications"
              className="flex w-fit max-w-full gap-1 rounded-full border border-slate-200 bg-white p-1.5 shadow-sm"
            >
              {NOTIFICATION_TABS.map((tab) => {
                const isActive = activeTab === tab.key
                return (
                  <button
                    key={tab.key}
                    role="tab"
                    type="button"
                    aria-selected={isActive}
                    onClick={() => setActiveTab(tab.key)}
                    className={cn(
                      'rounded-full px-4 py-1.5 text-sm font-semibold whitespace-nowrap transition-colors',
                      isActive
                        ? 'bg-blue-600 text-white shadow-sm shadow-blue-200'
                        : 'text-slate-500 hover:text-slate-900',
                    )}
                  >
                    {tab.label}
                  </button>
                )
              })}
            </div>
          </div>

          <NotificationList
            groups={groups}
            onOpen={openNotification}
            className="p-2 sm:p-3"
          />
        </div>
      </main>
    </div>
  )
}
