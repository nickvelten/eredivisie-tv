import Image from 'next/image'
import { Match } from '@/data/types'
import { formatTime } from '@/lib/utils'
import { BroadcastBadge } from './BroadcastBadge'

export function MatchCard({ match }: { match: Match }) {
  return (
    <div className="rounded-xl bg-[#141414] transition-colors hover:bg-[#1a1a1a]">
      {/* Top row: teams + time/score */}
      <div className="flex items-center justify-between px-4 py-3">
        <div className="flex items-center gap-3">
          <Image src={match.homeTeam.logo} alt={match.homeTeam.name} width={28} height={28} className="rounded-full" />
          <span className="text-sm font-semibold text-white">{match.homeTeam.name}</span>
          <span className="text-xs text-zinc-500">—</span>
          <span className="text-sm font-semibold text-white">{match.awayTeam.name}</span>
          <Image src={match.awayTeam.logo} alt={match.awayTeam.name} width={28} height={28} className="rounded-full" />
        </div>
        <div className="text-right">
          {match.status === 'finished' && match.score ? (
            <span className="text-sm font-bold text-white">{match.score.home} - {match.score.away}</span>
          ) : match.status === 'live' ? (
            <div className="flex items-center gap-2">
              <span className="rounded bg-[#e01e36] px-1.5 py-0.5 text-[10px] font-bold uppercase text-white">Live</span>
              {match.score && <span className="text-sm font-bold text-white">{match.score.home} - {match.score.away}</span>}
            </div>
          ) : (
            <span className="text-sm font-semibold text-[#e01e36]">{formatTime(match.date)}</span>
          )}
        </div>
      </div>
      {/* Bottom row: broadcast badges */}
      {match.broadcasts.length > 0 && (
        <div className="flex items-center gap-2 border-t border-white/5 px-4 py-2.5">
          <span className="text-[11px] uppercase tracking-wider text-zinc-500">Kijk op:</span>
          {match.broadcasts.map((b) => (
            <BroadcastBadge key={b.name} broadcast={b} />
          ))}
        </div>
      )}
    </div>
  )
}
