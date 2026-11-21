import { Match } from '@/data/types'

/** Per club only what this block shows, so the page does not ship the whole season. */
export function favoriteCandidates(matches: Match[]): Match[] {
  const sorted = [...matches].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
  const keep = new Set<string>()
  const clubIds = new Set(matches.flatMap((m) => [m.homeTeam.id, m.awayTeam.id]))
  for (const id of clubIds) {
    const own = sorted.filter((m) => m.homeTeam.id === id || m.awayTeam.id === id)
    own.filter((m) => m.status !== 'finished').slice(0, 2).forEach((m) => keep.add(m.id))
    const last = [...own].reverse().find((m) => m.status === 'finished')
    if (last) keep.add(last.id)
  }
  return sorted.filter((m) => keep.has(m.id))
}
