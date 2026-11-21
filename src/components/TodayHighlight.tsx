import { isToday, formatDutchDate, isSameDay } from '@/lib/utils'
import { MatchCard, MatchGrid } from './MatchCard'
import { KickoffCountdown } from './KickoffCountdown'
import { Match, StandingEntry } from '@/data/types'

// Lower is bigger: sum of both teams' league positions
function importance(m: Match, rank: Map<string, number>): number {
  return (rank.get(m.homeTeam.id) ?? 18) + (rank.get(m.awayTeam.id) ?? 18)
}

export function TodayHighlight({ matches, standings }: { matches: Match[]; standings: StandingEntry[] }) {
  const rank = new Map(standings.map((s) => [s.club.id, s.position]))
  const live = matches.filter((m) => m.status === 'live')
  const todayMatches = matches.filter((m) => isToday(m.date))

  let displayMatches: Match[]
  let title: string
  let subtitle: string | null = null

  if (todayMatches.length > 0) {
    displayMatches = todayMatches
    title = live.length > 0 ? 'Nu live' : 'Vandaag op TV'
    subtitle = `${todayMatches.length} wedstrijd${todayMatches.length > 1 ? 'en' : ''} vandaag`
  } else {
    const upcoming = matches
      .filter((m) => m.status === 'scheduled')
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    if (upcoming.length > 0) {
      const nextDay = upcoming[0].date
      displayMatches = upcoming.filter((m) => isSameDay(m.date, nextDay))
    } else {
      displayMatches = []
    }
    title = 'Eerstvolgende speeldag'
    if (displayMatches.length > 0) subtitle = formatDutchDate(displayMatches[0].date)
  }

  if (displayMatches.length === 0) {
    return (
      <section id="vandaag" className="w-full py-10">
        <h2 className="mb-4 text-2xl font-extrabold text-foreground">Vandaag</h2>
        <div className="rounded-xl border border-dashed border-border bg-card/50 px-5 py-8 text-center">
          <p className="text-sm font-semibold text-foreground">Geen wedstrijden in de planning</p>
          <p className="mt-1 text-sm text-muted">Zodra ESPN het nieuwe programma publiceert, zie je hier de eerstvolgende speeldag.</p>
        </div>
      </section>
    )
  }

  // Live matches first, then the topper, then the rest in kickoff order
  const byKickoff = (a: Match, b: Match) => new Date(a.date).getTime() - new Date(b.date).getTime()
  const featuredId = [...displayMatches]
    .filter((m) => m.status !== 'finished')
    .sort((a, b) => importance(a, rank) - importance(b, rank) || byKickoff(a, b))[0]?.id
  const sorted = [...displayMatches].sort((a, b) => {
    if ((a.status === 'live') !== (b.status === 'live')) return a.status === 'live' ? -1 : 1
    if ((a.id === featuredId) !== (b.id === featuredId)) return a.id === featuredId ? -1 : 1
    return byKickoff(a, b)
  })

  const nextKickoff = displayMatches
    .filter((m) => m.status === 'scheduled')
    .map((m) => m.date)
    .sort((a, b) => new Date(a).getTime() - new Date(b).getTime())[0]

  return (
    <section id="vandaag" className="w-full py-10">
      <div className="mb-5 flex flex-wrap items-end gap-3">
        <h2 className="text-2xl font-extrabold text-foreground">{title}</h2>
        {subtitle && (
          <span className="mb-0.5 rounded-full bg-accent-light px-3 py-0.5 text-xs font-semibold text-accent">
            {subtitle}
          </span>
        )}
        {nextKickoff && <KickoffCountdown date={nextKickoff} />}
      </div>
      <MatchGrid>
        {sorted.map((match) => (
          <MatchCard key={match.id} match={match} featured={match.id === featuredId && sorted.length > 1} />
        ))}
      </MatchGrid>
    </section>
  )
}
