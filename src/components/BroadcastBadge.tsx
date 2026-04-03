import { Broadcast } from '@/data/types'

const styles = {
  tv: 'bg-[#1a3a1a] text-[#4ade80]',
  online: 'bg-[#1a2a4a] text-[#60a5fa]',
  app: 'bg-[#2a1a3a] text-[#c084fc]',
}

const icons = {
  tv: '📺',
  online: '💻',
  app: '📱',
}

export function BroadcastBadge({ broadcast }: { broadcast: Broadcast }) {
  const inner = (
    <span className={`inline-flex items-center gap-1 rounded-md px-2.5 py-1 text-xs font-medium ${styles[broadcast.type]}`}>
      {icons[broadcast.type]} {broadcast.name}
    </span>
  )

  if (broadcast.url) {
    return (
      <a href={broadcast.url} target="_blank" rel="noopener noreferrer" className="transition-opacity hover:opacity-80">
        {inner}
      </a>
    )
  }
  return inner
}
