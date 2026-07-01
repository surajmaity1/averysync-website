import { POST_TYPE_ENUM } from '@/api/posts/posts.enum'
import { TUser } from '@/api/users/users.type'
import { AvatarUser } from '@/components/ui/avatar'
import { Code2, Hash, Image as ImageIcon, Radio } from 'lucide-react'

type FeedComposerProps = {
  user: TUser
  onCompose: (type: POST_TYPE_ENUM) => void
}

const COMPOSER_TOOLS = [
  { icon: ImageIcon, label: 'Media' },
  { icon: Code2, label: 'Snippet' },
  { icon: Hash, label: 'Topic' },
] as const

/**
 * Inline composer for the center column. Opens the shared create-post dialog —
 * "Post" defaults to a text post, "Start a Space" defaults to a SPACE.
 */
export const FeedComposer = ({ user, onCompose }: FeedComposerProps) => {
  return (
    <section className="flex gap-4 rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
      <AvatarUser src={user.image} name={user.name} size={44} />

      <div className="flex min-w-0 flex-1 flex-col gap-4">
        <button
          type="button"
          onClick={() => onCompose(POST_TYPE_ENUM.POST)}
          className="w-full rounded-full bg-slate-100 px-5 py-3 text-left text-base text-slate-500 transition-colors hover:bg-slate-200"
        >
          Share something with the community…
        </button>

        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="hidden gap-1 sm:flex">
            {COMPOSER_TOOLS.map(({ icon: Icon, label }) => (
              <button
                key={label}
                type="button"
                onClick={() => onCompose(POST_TYPE_ENUM.POST)}
                className="inline-flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-sm font-medium text-slate-500 transition-colors hover:bg-blue-50 hover:text-blue-600"
              >
                <Icon className="h-[18px] w-[18px]" />
                <span>{label}</span>
              </button>
            ))}
          </div>

          <div className="ml-auto flex items-center gap-2">
            <button
              type="button"
              onClick={() => onCompose(POST_TYPE_ENUM.SPACE)}
              className="inline-flex items-center gap-1.5 rounded-full bg-slate-100 px-4 py-2 text-sm font-semibold text-slate-700 transition-colors hover:bg-slate-200"
            >
              <Radio className="h-4 w-4 text-blue-600" strokeWidth={2.2} />
              <span>Start a Space</span>
            </button>
            <button
              type="button"
              onClick={() => onCompose(POST_TYPE_ENUM.POST)}
              className="rounded-full bg-blue-600 px-5 py-2 text-sm font-semibold text-white shadow-sm shadow-blue-200 transition-colors hover:bg-blue-700"
            >
              Post
            </button>
          </div>
        </div>
      </div>
    </section>
  )
}
