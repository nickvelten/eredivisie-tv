import type { Metadata } from 'next'
import Image from 'next/image'
import { fetchEredivisieData } from '@/lib/espn'
import { formatShortDate, formatTime, isSameDay, isToday } from '@/lib/utils'

export const revalidate = 300

export const metadata: Metadata = {
  title: 'Eredivisie op TV · widget',
  robots: { index: false, follow: true },
}

/**
 * Embeddable widget (iframe) with today's matches, or the next match day.
 * Every link opens eredivisie.tv in a new tab, which earns the backlinks.
 */
export default async function WidgetVandaag() {
  const { allMatches } = await fetchEredivisieData()
  const today = allMatches.filter((m) => isToday(m.date))
  const nextDay = allMatches.filter((m) => m.status === 'scheduled').sort((a, b) => a.date.localeCompare(b.date))[0]
  const list = (today.length > 0 ? today : nextDay ? allMatches.filter((m) => isSameDay(m.date, nextDay.date)) : []).sort((a, b) =>
    a.date.localeCompare(b.date)
  )

  return (
    <div className="min-h-screen bg-card p-3 text-foreground">
      <a href="https://eredivisie.tv/eredivisie-op-tv-vandaag" target="_blank" rel="noopener" data-event="widget_click" className="mb-2 flex items-center justify-between">
        <span className="text-sm font-extrabold">{today.length > 0 ? 'Eredivisie vandaag op TV' : `Eredivisie ${list[0] ? formatShortDate(list[0].date) : ''}`}</span>
        <span className="text-xs font-extrabold">
          eredivisie<span className="text-accent">.tv</span>
        </span>
      </a>
      {list.length === 0 ? (
        <p className="text-xs text-muted">Geen wedstrijden gepland.</p>
      ) : (
        <ul className="divide-y divide-border">
          {list.map((m) => (
            <li key={m.id}>
              <a href={`https://eredivisie.tv/wedstrijd/${m.slug}`} target="_blank" rel="noopener" className="flex items-center gap-2 py-1.5 text-xs hover:text-accent">
                <span className="w-10 shrink-0 font-bold tabular-nums">
                  {m.status === 'scheduled' ? formatTime(m.date) : `${m.score?.home ?? 0}-${m.score?.away ?? 0}`}
                </span>
                <Image src={m.homeTeam.logo} alt="" width={14} height={14} className="h-3.5 w-3.5" />
                <span className="min-w-0 flex-1 truncate font-semibold">
                  {m.homeTeam.shortName} – {m.awayTeam.shortName}
                </span>
                <span className="shrink-0 text-[10px] font-bold text-emerald-700 dark:text-emerald-400">
                  {m.broadcasts.find((b) => b.type === 'tv')?.name}
                </span>
              </a>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
