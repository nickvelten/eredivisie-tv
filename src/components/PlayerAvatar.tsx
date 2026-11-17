import Image from 'next/image'
import { Player } from '@/data/types'

function initials(name: string): string {
  const parts = name.split(/\s+/).filter(Boolean)
  return ((parts[0]?.[0] ?? '') + (parts.length > 1 ? parts[parts.length - 1][0] : '')).toUpperCase()
}

/**
 * Round player photo. ESPN has photos for roughly half the squad; the rest
 * get initials on the club colour.
 */
export function PlayerAvatar({ player, size, eager = false }: { player: Player; size: number; eager?: boolean }) {
  const style = { width: size, height: size }
  if (player.headshot) {
    return (
      <span className="block shrink-0 overflow-hidden rounded-full bg-background ring-1 ring-border" style={style}>
        <Image
          src={player.headshot}
          alt={player.name}
          width={size * 2}
          height={size * 2}
          loading={eager ? 'eager' : 'lazy'}
          className="h-full w-full object-cover object-top"
        />
      </span>
    )
  }
  return (
    <span
      aria-hidden="true"
      className="flex shrink-0 items-center justify-center rounded-full font-extrabold text-white"
      style={{ ...style, background: player.club.color ? `#${player.club.color}` : 'var(--accent)', fontSize: size * 0.36 }}
    >
      {initials(player.name)}
    </span>
  )
}
