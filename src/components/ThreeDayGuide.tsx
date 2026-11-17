import { Match } from '@/data/types'
import { amsterdamDate, amsterdamDayFromToday, formatDutchDate } from '@/lib/utils'
import { MatchCard, MatchGrid } from './MatchCard'

const LABELS = ['Vandaag', 'Morgen', 'Overmorgen']

/** TV guide for today, tomorrow and the day after. Days without matches are left out. */
export function ThreeDayGuide({ matches, startOffset = 0 }: { matches: Match[]; startOffset?: number }) {
  const days = [0, 1, 2]
    .map((i) => i + startOffset)
    .filter((o) => o <= 2)
    .map((offset) => {
      const key = amsterdamDayFromToday(offset)
      return { offset, list: matches.filter((m) => amsterdamDate(m.date) === key).sort((a, b) => a.date.localeCompare(b.date)) }
    })
    .filter((d) => d.list.length > 0)
  if (days.length === 0) return null
  return (
    <>
      {days.map(({ offset, list }) => (
        <section key={offset} className="w-full py-8">
          <h2 className="mb-4 text-2xl font-extrabold text-foreground">
            {LABELS[offset]} <span className="text-base font-semibold text-muted">· {formatDutchDate(list[0].date)}</span>
          </h2>
          <MatchGrid>
            {list.map((m) => (
              <MatchCard key={m.id} match={m} />
            ))}
          </MatchGrid>
        </section>
      ))}
    </>
  )
}
