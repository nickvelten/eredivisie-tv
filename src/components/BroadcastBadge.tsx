import { Broadcast } from '@/data/types'

const styles = {
  tv: 'bg-emerald-50 text-emerald-700 ring-emerald-200',
  online: 'bg-blue-50 text-blue-700 ring-blue-200',
  app: 'bg-purple-50 text-purple-700 ring-purple-200',
}

const icons = {
  tv: '📺',
  online: '💻',
  app: '📱',
}

export function BroadcastBadge({ broadcast }: { broadcast: Broadcast }) {
  const inner = (
    <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[11px] font-semibold ring-1 ${styles[broadcast.type]}`}>
      {icons[broadcast.type]} {broadcast.name}
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
