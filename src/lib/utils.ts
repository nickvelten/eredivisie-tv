const DUTCH_DAYS = ['zondag', 'maandag', 'dinsdag', 'woensdag', 'donderdag', 'vrijdag', 'zaterdag']
const DUTCH_MONTHS = ['januari', 'februari', 'maart', 'april', 'mei', 'juni', 'juli', 'augustus', 'september', 'oktober', 'november', 'december']

export function formatDutchDate(dateStr: string): string {
  const date = new Date(dateStr)
  const day = DUTCH_DAYS[date.getDay()]
  const num = date.getDate()
  const month = DUTCH_MONTHS[date.getMonth()]
  return `${day} ${num} ${month}`
}

export function formatTime(dateStr: string): string {
  const date = new Date(dateStr)
  return date.toLocaleTimeString('nl-NL', { hour: '2-digit', minute: '2-digit' })
}

export function groupMatchesByDate<T extends { date: string }>(matches: T[]): Map<string, T[]> {
  const groups = new Map<string, typeof matches>()
  for (const match of matches) {
    const key = new Date(match.date).toISOString().split('T')[0]
    const existing = groups.get(key) ?? []
    existing.push(match)
    groups.set(key, existing)
  }
  return groups
}

export function isToday(dateStr: string): boolean {
  const date = new Date(dateStr)
  const now = new Date()
  return date.toISOString().split('T')[0] === now.toISOString().split('T')[0]
}
