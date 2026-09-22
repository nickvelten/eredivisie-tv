'use client'

import { Matchweek } from '@/data/types'

const buttonClass =
  'shrink-0 whitespace-nowrap rounded-lg bg-card px-3 py-2 text-sm font-medium text-muted shadow-sm ring-1 ring-border transition-all hover:shadow-md hover:text-foreground disabled:opacity-30 disabled:hover:shadow-sm sm:px-4'

export function WeekNav({
  title,
  week,
  index,
  count,
  onChange,
}: {
  title: string
  week: Matchweek
  index: number
  count: number
  onChange: (updater: (i: number) => number) => void
}) {
  const roundLabel = week.isCatchUp ? 'Inhaalwedstrijden' : `Speelronde ${week.round}`
  return (
    <div className="mb-6 flex items-center justify-between gap-3">
      <button onClick={() => onChange((i) => Math.max(0, i - 1))} disabled={index === 0} className={buttonClass} aria-label="Vorige speelronde">
        ← <span className="hidden sm:inline">Vorige</span>
      </button>
      <div className="min-w-0 text-center">
        <h2 className="text-2xl font-extrabold text-foreground">{title}</h2>
        <p className="truncate text-xs text-muted-light">
          <span className="font-semibold text-muted">{roundLabel}</span> · {week.label}
        </p>
      </div>
      <button onClick={() => onChange((i) => Math.min(count - 1, i + 1))} disabled={index === count - 1} className={buttonClass} aria-label="Volgende speelronde">
        <span className="hidden sm:inline">Volgende</span> →
      </button>
    </div>
  )
}
