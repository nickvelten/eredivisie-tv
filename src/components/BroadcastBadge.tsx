import { Broadcast } from '@/data/types'

const styles = {
  tv: 'bg-emerald-500/10 text-emerald-700 ring-emerald-500/30 dark:text-emerald-400',
  online: 'bg-blue-500/10 text-blue-700 ring-blue-500/30 dark:text-blue-400',
  app: 'bg-purple-500/10 text-purple-700 ring-purple-500/30 dark:text-purple-400',
}

export function BroadcastBadge({ broadcast }: { broadcast: Broadcast }) {
  const isTv = broadcast.type === 'tv'

  const inner = (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 ring-1 ${styles[broadcast.type]} ${
        isTv ? 'text-xs font-bold sm:text-[13px]' : 'text-[11px] font-semibold'
      }`}
    >
      {isTv && <span className="text-[10px]">📺</span>}
      {broadcast.name}
    </span>
  )

  if (broadcast.url) {
    return (
      <a href={broadcast.url} target="_blank" rel="noopener noreferrer" className="transition-opacity hover:opacity-70">
        {inner}
      </a>
    )
  }
  return inner
}
