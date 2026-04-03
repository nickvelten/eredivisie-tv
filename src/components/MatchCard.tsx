import Image from 'next/image'
import { Match } from '@/data/types'
import { formatTime } from '@/lib/utils'
import { BroadcastBadge } from './BroadcastBadge'

export function MatchCard({ match }: { match: Match }) {
  return (
    <div className="rounded-xl bg-white shadow-sm ring-1 ring-black/5 transition-shadow hover:shadow-md">
      <div className="flex items-center justify-between px-5 py-3.5">
        <div className="flex items-center gap-3">
          <Image src={match.homeTeam.logo} alt={match.homeTeam.name} width={30} height={30} />
          <span className="text-sm font-bold text-foreground">{match.homeTeam.name}</span>
          <span className="text-xs font-medium text-muted-light">vs</span>
          <span className="text-sm font-bold text-foreground">{match.awayTeam.name}</span>
          <Image src={match.awayTeam.logo} alt={match.awayTeam.name} width={30} height={30} />
        </div>
        <div className="text-right">
          {match.status === 'finished' && match.score ? (
            <span className="rounded-md bg-foreground/5 px-2.5 py-1 text-sm font-bold text-foreground">{match.score.home} - {match.score.away}</span>
          ) : match.status === 'live' ? (
            <div className="flex items-center gap-2">
              <span className="animate-pulse rounded-full bg-accent px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-white">Live</span>
              {match.score && <span className="text-sm font-bold text-foreground">{match.score.home} - {match.score.away}</span>}
            </div>
          ) : (
            <span className="rounded-md bg-accent-light px-2.5 py-1 text-sm font-bold text-accent">{formatTime(match.date)}</span>
          )}
        </div>
      </div>
      <div className="flex items-center gap-2 border-t border-black/5 px-5 py-2.5">
        {match.broadcasts.length > 0 && (
          <>
            <span className="text-[11px] font-medium uppercase tracking-wider text-muted-light">Kijk op:</span>
            {match.broadcasts.map((b) => (
              <BroadcastBadge key={b.name} broadcast={b} />
            ))}
          </>
        )}
        <a
          href="https://www.unibet.nl"
          target="_blank"
          rel="noopener noreferrer"
          className="ml-auto inline-flex items-center gap-1.5 rounded-full bg-gradient-to-r from-amber-400 to-orange-500 px-3 py-1 text-[11px] font-bold text-white shadow-sm transition-all hover:shadow-md hover:brightness-110"
        >
          Zet in bij Unibet →
        </a>
      </div>
    </div>
  )
}
