import { Club, Match } from '@/data/types'

const TZ = 'Europe/Amsterdam'

export function uniqueClubs(matches: Match[]): Club[] {
  const map = new Map<string, Club>()
  for (const m of matches) {
    map.set(m.homeTeam.id, m.homeTeam)
    map.set(m.awayTeam.id, m.awayTeam)
  }
  return [...map.values()].sort((a, b) => a.name.localeCompare(b.name, 'nl'))
}

export function formatDutchDate(dateStr: string): string {
  const date = new Date(dateStr)
  // Use Intl to get the correct day/date in Dutch timezone
  const parts = new Intl.DateTimeFormat('nl-NL', {
    timeZone: TZ,
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  }).formatToParts(date)

  const weekday = parts.find((p) => p.type === 'weekday')?.value ?? ''
  const day = parts.find((p) => p.type === 'day')?.value ?? ''
  const month = parts.find((p) => p.type === 'month')?.value ?? ''

  return `${weekday} ${day} ${month}`
}

function shortDateParts(date: Date): { weekday: string; day: string; month: string } {
  const parts = new Intl.DateTimeFormat('nl-NL', {
    timeZone: TZ,
    weekday: 'short',
    day: 'numeric',
    month: 'long',
  }).formatToParts(date)
  const get = (type: string) => parts.find((p) => p.type === type)?.value ?? ''
  return { weekday: get('weekday').replace('.', ''), day: get('day'), month: get('month') }
}

// "vr 18 – zo 20 september", "vr 30 oktober – zo 1 november" or "di 15 september"
export function formatDateRange(startStr: string, endStr: string): string {
  const start = shortDateParts(new Date(startStr))
  const end = shortDateParts(new Date(endStr))
  if (start.day === end.day && start.month === end.month) {
    return `${start.weekday} ${start.day} ${start.month}`
  }
  if (start.month === end.month) {
    return `${start.weekday} ${start.day} – ${end.weekday} ${end.day} ${end.month}`
  }
  return `${start.weekday} ${start.day} ${start.month} – ${end.weekday} ${end.day} ${end.month}`
}

export function formatTime(dateStr: string): string {
  const date = new Date(dateStr)
  return date.toLocaleTimeString('nl-NL', {
    hour: '2-digit',
    minute: '2-digit',
    timeZone: TZ,
  })
}

export function groupMatchesByDate<T extends { date: string }>(matches: T[]): Map<string, T[]> {
  const groups = new Map<string, typeof matches>()
  for (const match of matches) {
    // Group by date in Dutch timezone
    const key = new Intl.DateTimeFormat('sv-SE', { timeZone: TZ }).format(new Date(match.date))
    const existing = groups.get(key) ?? []
    existing.push(match)
    groups.set(key, existing)
  }
  return groups
}

export function isSameDay(dateStr1: string, dateStr2: string): boolean {
  const fmt = new Intl.DateTimeFormat('sv-SE', { timeZone: TZ })
  return fmt.format(new Date(dateStr1)) === fmt.format(new Date(dateStr2))
}

export function isToday(dateStr: string): boolean {
  const matchDate = new Intl.DateTimeFormat('sv-SE', { timeZone: TZ }).format(new Date(dateStr))
  const today = new Intl.DateTimeFormat('sv-SE', { timeZone: TZ }).format(new Date())
  return matchDate === today
}
