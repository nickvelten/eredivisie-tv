import { matchweeks } from '@/data/matches'
import { isToday, formatDutchDate } from '@/lib/utils'
import { MatchCard } from './MatchCard'
import { Match } from '@/data/types'

export function TodayHighlight() {
  const allMatches = matchweeks.flatMap((mw) => mw.matches)
  const todayMatches = allMatches.filter((m) => isToday(m.date))

  let displayMatches: Match[]
  let title: string

  if (todayMatches.length > 0) {
    displayMatches = todayMatches
    title = 'Vandaag op TV'
  } else {
    const upcoming = allMatches
      .filter((m) => m.status === 'scheduled')
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    displayMatches = upcoming.slice(0, 3)
    title = displayMatches.length > 0
      ? `Eerstvolgende: ${formatDutchDate(displayMatches[0].date)}`
      : 'Geen wedstrijden gepland'
  }

  if (displayMatches.length === 0) return null

  return (
    <section id="vandaag" className="mx-auto w-full max-w-5xl px-4 py-8">
      <h2 className="mb-4 text-xl font-bold text-white">
        {title}
      </h2>
      <div className="flex flex-col gap-3">
        {displayMatches.map((match) => (
          <MatchCard key={match.id} match={match} />
        ))}
      </div>
    </section>
  )
}
