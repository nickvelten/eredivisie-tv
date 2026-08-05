import { isToday, formatDutchDate, isSameDay } from '@/lib/utils'
import { MatchCard } from './MatchCard'
import { KickoffCountdown } from './KickoffCountdown'
import { Match } from '@/data/types'

export function TodayHighlight({ matches }: { matches: Match[] }) {
  const todayMatches = matches.filter((m) => isToday(m.date))

  let displayMatches: Match[]
  let title: string
  let subtitle: string | null = null

  if (todayMatches.length > 0) {
    displayMatches = todayMatches
    title = 'Vandaag op TV'
    subtitle = `${todayMatches.length} wedstrijd${todayMatches.length > 1 ? 'en' : ''} vandaag`
  } else {
    const upcoming = matches
      .filter((m) => m.status === 'scheduled')
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    // Show ALL matches of the next match day, not just 3
    if (upcoming.length > 0) {
      const nextDay = upcoming[0].date
      displayMatches = upcoming.filter((m) => isSameDay(m.date, nextDay))
    } else {
      displayMatches = []
    }
    title = displayMatches.length > 0 ? 'Eerstvolgende wedstrijden' : 'Geen wedstrijden gepland'
    if (displayMatches.length > 0) {
      subtitle = formatDutchDate(displayMatches[0].date)
    }
  }

  if (displayMatches.length === 0) return null

  // Countdown to the first upcoming kickoff among the displayed matches
  const nextKickoff = displayMatches
    .filter((m) => m.status === 'scheduled')
    .map((m) => m.date)
    .sort((a, b) => new Date(a).getTime() - new Date(b).getTime())[0]

  return (
    <section id="vandaag" className="mx-auto w-full max-w-5xl px-4 py-10">
      <div className="mb-5 flex flex-wrap items-end gap-3">
        <h2 className="text-2xl font-extrabold text-foreground">{title}</h2>
        {subtitle && (
          <span className="mb-0.5 rounded-full bg-accent-light px-3 py-0.5 text-xs font-semibold text-accent">
            {subtitle}
          </span>
        )}
        {nextKickoff && <KickoffCountdown date={nextKickoff} />}
      </div>
      <div className="flex flex-col gap-3">
        {displayMatches.map((match) => (
          <MatchCard key={match.id} match={match} />
        ))}
      </div>
    </section>
  )
}
