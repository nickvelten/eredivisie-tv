const TZ = 'Europe/Amsterdam'

const DUTCH_DAYS = ['zondag', 'maandag', 'dinsdag', 'woensdag', 'donderdag', 'vrijdag', 'zaterdag']
const DUTCH_MONTHS = ['januari', 'februari', 'maart', 'april', 'mei', 'juni', 'juli', 'augustus', 'september', 'oktober', 'november', 'december']

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
