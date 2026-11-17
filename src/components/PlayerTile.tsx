import Link from 'next/link'
import { Player } from '@/data/types'
import { PlayerAvatar } from './PlayerAvatar'

/** Compact player row for squads: shirt number, photo, name and key stats. */
export function PlayerTile({ player, showClub = false }: { player: Player; showClub?: boolean }) {
  const { stats } = player
  const detail =
    player.position === 'Keeper'
      ? `${stats.appearances} wed. · ${stats.saves} reddingen`
      : `${stats.appearances} wed. · ${stats.goals} goals · ${stats.assists} assists`
  return (
    <Link
      href={`/speler/${player.slug}`}
      className="flex items-center gap-3 rounded-xl bg-card px-3 py-2.5 shadow-sm ring-1 ring-border transition-all hover:shadow-md hover:ring-accent/30"
    >
      <span className="w-6 shrink-0 text-center text-sm font-extrabold tabular-nums text-muted-light">{player.jersey ?? ''}</span>
      <PlayerAvatar player={player} size={36} />
      <span className="min-w-0 flex-1">
        <span className="block truncate text-sm font-semibold text-foreground">{player.name}</span>
        <span className="block truncate text-xs text-muted">{showClub ? `${player.club.shortName} · ${detail}` : detail}</span>
      </span>
    </Link>
  )
}
