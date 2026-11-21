import { Club, FormResult, Match, StandingEntry } from '@/data/types'

export type TableScope = 'all' | 'home' | 'away'

type Row = Omit<StandingEntry, 'position' | 'form'> & { results: { date: string; r: FormResult }[] }

/**
 * Builds a league table from match results (3-1-0, then goal difference,
 * goals scored, name). Used for home/away and form tables, round reviews and
 * the table calculator; the official table still comes from ESPN.
 */
export function computeTable(matches: Match[], clubs: Club[], { scope = 'all', lastN }: { scope?: TableScope; lastN?: number } = {}): StandingEntry[] {
  const rows = new Map<string, Row>(
    clubs.map((club) => [club.id, { club, played: 0, won: 0, drawn: 0, lost: 0, goalsFor: 0, goalsAgainst: 0, points: 0, results: [] }])
  )
  const played = matches.filter((m) => m.status === 'finished' && m.score).sort((a, b) => a.date.localeCompare(b.date))

  const add = (clubId: string, gf: number, ga: number, date: string) => {
    const row = rows.get(clubId)
    if (!row) return
    const r: FormResult = gf > ga ? 'W' : gf === ga ? 'D' : 'L'
    row.results.push({ date, r })
  }
  for (const m of played) {
    if (scope !== 'away') add(m.homeTeam.id, m.score!.home, m.score!.away, m.date)
    if (scope !== 'home') add(m.awayTeam.id, m.score!.away, m.score!.home, m.date)
  }
  // Second pass so lastN can trim per club before totals are counted
  const totals = new Map<string, { gf: number; ga: number; r: FormResult }[]>()
  for (const m of played) {
    const entries: [string, number, number][] = []
    if (scope !== 'away') entries.push([m.homeTeam.id, m.score!.home, m.score!.away])
    if (scope !== 'home') entries.push([m.awayTeam.id, m.score!.away, m.score!.home])
    for (const [id, gf, ga] of entries) {
      if (!rows.has(id)) continue
      const list = totals.get(id) ?? []
      list.push({ gf, ga, r: gf > ga ? 'W' : gf === ga ? 'D' : 'L' })
      totals.set(id, list)
    }
  }
  for (const [id, list] of totals) {
    const row = rows.get(id)!
    for (const g of lastN ? list.slice(-lastN) : list) {
      row.played++
      row.goalsFor += g.gf
      row.goalsAgainst += g.ga
      if (g.r === 'W') {
        row.won++
        row.points += 3
      } else if (g.r === 'D') {
        row.drawn++
        row.points += 1
      } else row.lost++
    }
  }

  return [...rows.values()]
    .sort(
      (a, b) =>
        b.points - a.points ||
        b.goalsFor - b.goalsAgainst - (a.goalsFor - a.goalsAgainst) ||
        b.goalsFor - a.goalsFor ||
        a.club.name.localeCompare(b.club.name, 'nl')
    )
    .map(({ results, ...row }, i) => ({ ...row, position: i + 1, form: results.slice(-5).map((x) => x.r) }))
}

/** Remaining fixtures of a club with the average current position of its opponents (lower = harder). */
export function remainingSchedule(clubId: string, matches: Match[], standings: StandingEntry[]) {
  const rank = new Map(standings.map((s) => [s.club.id, s.position]))
  const remaining = matches
    .filter((m) => m.status !== 'finished' && (m.homeTeam.id === clubId || m.awayTeam.id === clubId))
    .sort((a, b) => a.date.localeCompare(b.date))
  const opponents = remaining.map((m) => (m.homeTeam.id === clubId ? m.awayTeam : m.homeTeam))
  const positions = opponents.map((o) => rank.get(o.id)).filter((p): p is number => p !== undefined)
  const avg = positions.length ? positions.reduce((a, b) => a + b, 0) / positions.length : null
  const home = remaining.filter((m) => m.homeTeam.id === clubId).length
  return { remaining, avgOpponentPosition: avg, home, away: remaining.length - home }
}
