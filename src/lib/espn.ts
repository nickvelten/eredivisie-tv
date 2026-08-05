import { Match, Matchweek, StandingEntry, Odds, TopScorer, TopAssister, FormResult, SeasonInfo } from '@/data/types'

const ESPN_API = 'https://site.api.espn.com/apis'
const LEAGUE = 'ned.1'
const REVALIDATE = 3600 // 1 hour

// --- ESPN API response types ---

interface ESPNTeam {
  id: string
  displayName: string
  abbreviation: string
  logo?: string
  logos?: Array<{ href: string }>
}

interface ESPNCompetitor {
  homeAway: 'home' | 'away'
  score: string
  team: ESPNTeam
}

interface ESPNOdds {
  provider: { id: string; name: string }
  moneyline?: {
    home?: { close?: { odds: string } }
    away?: { close?: { odds: string } }
    draw?: { close?: { odds: string } }
  }
}

interface ESPNEvent {
  id: string
  date: string
  name: string
  competitions: Array<{
    competitors: ESPNCompetitor[]
    status: {
      type: {
        name: string
        state: string
        completed: boolean
      }
    }
    odds?: ESPNOdds[]
  }>
}

interface ESPNScoreboardResponse {
  leagues: Array<{
    id: string
    calendar: string[]
    season?: { year: number; displayName?: string }
  }>
  events: ESPNEvent[]
}

interface ESPNLeaderAthlete {
  id: string
  displayName: string
  flag?: { href: string; alt: string }
}

interface ESPNLeaderEntry {
  displayValue: string
  value: number
  athlete: ESPNLeaderAthlete
}

interface ESPNLeadersResponse {
  leaders: {
    categories: Array<{
      name: string
      displayName: string
      leaders: ESPNLeaderEntry[]
    }>
  }
}

interface ESPNStandingsResponse {
  children: Array<{
    standings: {
      entries: Array<{
        team: ESPNTeam
        stats: Array<{
          name: string
          value: number
        }>
      }>
    }
  }>
}

// --- Date helpers ---

function formatDateParam(date: Date): string {
  return date.toISOString().slice(0, 10).replace(/-/g, '')
}

// --- Calendar → Matchweek grouping ---

function groupCalendarIntoWeeks(calendar: string[]): { start: Date; end: Date; number: number }[] {
  if (calendar.length === 0) return []

  const dates = calendar.map((d) => new Date(d)).sort((a, b) => a.getTime() - b.getTime())
  const weeks: { start: Date; end: Date; number: number }[] = []

  let weekStart = dates[0]
  let weekEnd = dates[0]
  let weekNum = 1

  for (let i = 1; i < dates.length; i++) {
    const gapDays = (dates[i].getTime() - weekEnd.getTime()) / (1000 * 60 * 60 * 24)
    if (gapDays <= 5) {
      weekEnd = dates[i]
    } else {
      weeks.push({ start: weekStart, end: weekEnd, number: weekNum++ })
      weekStart = dates[i]
      weekEnd = dates[i]
    }
  }
  weeks.push({ start: weekStart, end: weekEnd, number: weekNum })

  return weeks
}

function findCurrentWeekIndex(weeks: { start: Date; end: Date }[], today: Date): number {
  for (let i = 0; i < weeks.length; i++) {
    if (today <= weeks[i].end) return i
  }
  return weeks.length - 1
}

// --- Data transformers ---

// Convert American odds to European decimal odds
function americanToDecimal(american: string): number {
  const num = parseInt(american)
  if (isNaN(num)) return 0
  if (num > 0) return Math.round(((num / 100) + 1) * 100) / 100
  return Math.round(((100 / Math.abs(num)) + 1) * 100) / 100
}

function extractOdds(comp: ESPNEvent['competitions'][0]): Odds | undefined {
  const oddsData = comp.odds?.[0]
  if (!oddsData?.moneyline) return undefined

  const home = oddsData.moneyline.home?.close?.odds
  const draw = oddsData.moneyline.draw?.close?.odds
  const away = oddsData.moneyline.away?.close?.odds

  if (!home || !draw || !away) return undefined

  return {
    home: americanToDecimal(home),
    draw: americanToDecimal(draw),
    away: americanToDecimal(away),
  }
}

function getTeamLogo(team: ESPNTeam): string {
  if (team.logo) return team.logo
  if (team.logos?.[0]?.href) return team.logos[0].href
  return `https://a.espncdn.com/i/teamlogos/soccer/500/${team.id}.png`
}

function transformEvent(event: ESPNEvent): Match {
  const comp = event.competitions[0]
  const home = comp.competitors.find((c) => c.homeAway === 'home')!
  const away = comp.competitors.find((c) => c.homeAway === 'away')!

  const statusName = comp.status.type.name
  const state = comp.status.type.state
  let status: Match['status'] = 'scheduled'
  if (comp.status.type.completed || statusName === 'STATUS_FULL_TIME' || statusName === 'STATUS_FINAL') {
    status = 'finished'
  } else if (state === 'in') {
    status = 'live'
  }

  return {
    id: event.id,
    homeTeam: {
      id: home.team.id,
      name: home.team.displayName,
      shortName: home.team.abbreviation,
      logo: getTeamLogo(home.team),
    },
    awayTeam: {
      id: away.team.id,
      name: away.team.displayName,
      shortName: away.team.abbreviation,
      logo: getTeamLogo(away.team),
    },
    date: event.date,
    status,
    score:
      status !== 'scheduled'
        ? { home: parseInt(home.score) || 0, away: parseInt(away.score) || 0 }
        : undefined,
    broadcasts: [
      { name: 'ESPN', type: 'tv' },
      { name: 'ESPN.nl', type: 'online', url: 'https://www.espn.nl' },
    ],
    odds: status === 'scheduled' ? extractOdds(comp) : undefined,
  }
}

function transformStandings(data: ESPNStandingsResponse): StandingEntry[] {
  const entries = data.children?.[0]?.standings?.entries ?? []

  return entries
    .map((entry) => {
      const stat = (name: string) => entry.stats.find((s) => s.name === name)?.value ?? 0

      return {
        position: 0, // assigned after sorting
        club: {
          id: entry.team.id,
          name: entry.team.displayName,
          shortName: entry.team.abbreviation,
          logo: getTeamLogo(entry.team),
        },
        played: stat('gamesPlayed'),
        won: stat('wins'),
        drawn: stat('ties'),
        lost: stat('losses'),
        goalsFor: stat('pointsFor'),
        goalsAgainst: stat('pointsAgainst'),
        points: stat('points'),
      }
    })
    .sort((a, b) => b.points - a.points || (b.goalsFor - b.goalsAgainst) - (a.goalsFor - a.goalsAgainst))
    .map((entry, i) => ({ ...entry, position: i + 1 }))
}

// --- Leaders transform ---

function transformLeaders(data: ESPNLeadersResponse): { topScorers: TopScorer[]; topAssisters: TopAssister[] } {
  const categories = data.leaders?.categories ?? []

  const goalsCategory = categories.find((c) => c.name === 'goalsLeaders') ?? categories.find((c) => c.name === 'goals')
  const assistsCategory = categories.find((c) => c.name === 'assistsLeaders') ?? categories.find((c) => c.name === 'assists')

  const topScorers: TopScorer[] = (goalsCategory?.leaders ?? []).slice(0, 15).map((l, i) => {
    const matchesMatch = l.displayValue.match(/Matches:\s*(\d+)/)
    return {
      position: i + 1,
      name: l.athlete.displayName,
      goals: Math.round(l.value),
      matches: matchesMatch ? parseInt(matchesMatch[1]) : 0,
      flag: l.athlete.flag?.href,
    }
  })

  const topAssisters: TopAssister[] = (assistsCategory?.leaders ?? []).slice(0, 15).map((l, i) => {
    const matchesMatch = l.displayValue.match(/Matches:\s*(\d+)/)
    return {
      position: i + 1,
      name: l.athlete.displayName,
      assists: Math.round(l.value),
      matches: matchesMatch ? parseInt(matchesMatch[1]) : 0,
      flag: l.athlete.flag?.href,
    }
  })

  return { topScorers, topAssisters }
}

// --- Season helpers ---

function seasonLabel(year: number): string {
  return `${year}/${String(year + 1).slice(2)}`
}

async function fetchLeadersForSeason(year: number): Promise<{ topScorers: TopScorer[]; topAssisters: TopAssister[] }> {
  const url = `${ESPN_API}/site/v3/sports/soccer/${LEAGUE}/leaders?season=${year}&seasontype=1`
  const res = await fetch(url, { next: { revalidate: REVALIDATE } })
  if (!res.ok) return { topScorers: [], topAssisters: [] }
  return transformLeaders(await res.json())
}

async function fetchStandingsForSeason(year: number): Promise<StandingEntry[]> {
  const url = `${ESPN_API}/v2/sports/soccer/${LEAGUE}/standings?season=${year}`
  const res = await fetch(url, { next: { revalidate: REVALIDATE } })
  if (!res.ok) return []
  return transformStandings(await res.json())
}

// --- Form calculation ---

function calculateForm(teamId: string, matches: Match[], count = 5): FormResult[] {
  const finished = matches
    .filter((m) => m.status === 'finished' && m.score && (m.homeTeam.id === teamId || m.awayTeam.id === teamId))
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, count)

  return finished.map((m) => {
    const isHome = m.homeTeam.id === teamId
    const goalsFor = isHome ? m.score!.home : m.score!.away
    const goalsAgainst = isHome ? m.score!.away : m.score!.home
    if (goalsFor > goalsAgainst) return 'W'
    if (goalsFor < goalsAgainst) return 'L'
    return 'D'
  }).reverse() // oldest first, so reading left-to-right is chronological
}

// --- ESPN channel assignment heuristic ---
// ESPN NL assigns channels by match importance per timeslot:
// ESPN 1 = top match, ESPN 2/3/4 = others

const CHANNEL_NAMES = ['ESPN 1', 'ESPN 2', 'ESPN 3', 'ESPN 4']

function assignChannels(matches: Match[], standings: StandingEntry[]): Match[] {
  // Build a ranking map: team ID → standing position (lower = better)
  const rankMap = new Map<string, number>()
  for (const entry of standings) {
    rankMap.set(entry.club.id, entry.position)
  }

  // "Importance" score: sum of both teams' positions (lower = bigger match)
  function matchImportance(m: Match): number {
    const homeRank = rankMap.get(m.homeTeam.id) ?? 18
    const awayRank = rankMap.get(m.awayTeam.id) ?? 18
    return homeRank + awayRank
  }

  // Group matches into timeslots (within 30 minutes of each other)
  const timeslots: Match[][] = []
  const sorted = [...matches].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())

  for (const match of sorted) {
    const matchTime = new Date(match.date).getTime()
    const lastSlot = timeslots[timeslots.length - 1]
    if (lastSlot) {
      const slotTime = new Date(lastSlot[0].date).getTime()
      if (Math.abs(matchTime - slotTime) <= 30 * 60 * 1000) {
        lastSlot.push(match)
        continue
      }
    }
    timeslots.push([match])
  }

  // For each timeslot, rank by importance and assign channels
  const channelMap = new Map<string, string>()
  for (const slot of timeslots) {
    const ranked = [...slot].sort((a, b) => matchImportance(a) - matchImportance(b))
    ranked.forEach((m, i) => {
      channelMap.set(m.id, CHANNEL_NAMES[Math.min(i, CHANNEL_NAMES.length - 1)])
    })
  }

  // Apply channel assignments to broadcasts
  return matches.map((m) => {
    const channel = channelMap.get(m.id) ?? 'ESPN'
    return {
      ...m,
      broadcasts: [
        { name: channel, type: 'tv' as const },
        { name: 'ESPN.nl', type: 'online' as const, url: 'https://www.espn.nl' },
      ],
    }
  })
}

// --- Main fetch function ---

export async function fetchEredivisieData(): Promise<{
  matchweeks: Matchweek[]
  standings: StandingEntry[]
  allMatches: Match[]
  topScorers: TopScorer[]
  topAssisters: TopAssister[]
  standingsSeason: SeasonInfo | null
  leadersSeason: SeasonInfo | null
}> {
  try {
    // 1. Fetch scoreboard to get calendar
    const calUrl = `${ESPN_API}/site/v2/sports/soccer/${LEAGUE}/scoreboard`
    const calRes = await fetch(calUrl, { next: { revalidate: REVALIDATE } })
    if (!calRes.ok) throw new Error('Failed to fetch calendar')
    const calData: ESPNScoreboardResponse = await calRes.json()

    const calendar = calData.leagues[0]?.calendar ?? []
    const weeks = groupCalendarIntoWeeks(calendar)

    // Current season year from ESPN (e.g. 2026 for the 2026/27 season)
    const seasonYear = calData.leagues[0]?.season?.year ?? new Date().getFullYear()

    // 2. Find current week and determine fetch range (wider range for results)
    const today = new Date()
    const currentIdx = findCurrentWeekIndex(weeks, today)
    const startIdx = Math.max(0, currentIdx - 4)
    const endIdx = Math.min(weeks.length - 1, currentIdx + 2)

    // Extend date range by 1 day on each side for safety
    const rangeStart = new Date(weeks[startIdx].start)
    rangeStart.setDate(rangeStart.getDate() - 1)
    const rangeEnd = new Date(weeks[endIdx].end)
    rangeEnd.setDate(rangeEnd.getDate() + 1)

    // 3. Fetch matches for the range
    const matchUrl = `${ESPN_API}/site/v2/sports/soccer/${LEAGUE}/scoreboard?dates=${formatDateParam(rangeStart)}-${formatDateParam(rangeEnd)}&limit=200`
    const matchRes = await fetch(matchUrl, { next: { revalidate: REVALIDATE } })
    if (!matchRes.ok) throw new Error('Failed to fetch matches')
    const matchData: ESPNScoreboardResponse = await matchRes.json()

    const allMatches = matchData.events.map(transformEvent)

    // 4. Assign matches to matchweeks
    const matchweeks: Matchweek[] = []
    for (let i = startIdx; i <= endIdx; i++) {
      const week = weeks[i]
      const weekMatches = allMatches.filter((m) => {
        const matchDate = new Date(m.date)
        const dayBefore = new Date(week.start)
        dayBefore.setDate(dayBefore.getDate() - 1)
        const dayAfter = new Date(week.end)
        dayAfter.setDate(dayAfter.getDate() + 1)
        return matchDate >= dayBefore && matchDate <= dayAfter
      })

      if (weekMatches.length > 0) {
        matchweeks.push({
          number: week.number,
          matches: weekMatches.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()),
        })
      }
    }

    // 5. Fetch standings, leaders, and recent results (for form) in parallel.
    // Leaders and standings use the current season; early in a new season, when
    // no matches have been played yet, fall back to the previous season so the
    // page never shows an empty list or an all-zero table.
    const formStart = new Date()
    formStart.setDate(formStart.getDate() - 60)
    const formUrl = `${ESPN_API}/site/v2/sports/soccer/${LEAGUE}/scoreboard?dates=${formatDateParam(formStart)}-${formatDateParam(new Date())}&limit=200`

    const [currentStandings, currentLeaders, formRes] = await Promise.all([
      fetchStandingsForSeason(seasonYear),
      fetchLeadersForSeason(seasonYear),
      fetch(formUrl, { next: { revalidate: REVALIDATE } }),
    ])

    const formMatches = formRes.ok ? (await formRes.json() as ESPNScoreboardResponse).events.map(transformEvent) : allMatches

    let standings = currentStandings
    let standingsSeason: SeasonInfo | null = standings.length > 0 ? { label: seasonLabel(seasonYear), isCurrent: true } : null
    const seasonNotStarted = standings.length > 0 && standings.every((s) => s.played === 0)
    if (standings.length === 0 || seasonNotStarted) {
      const previous = await fetchStandingsForSeason(seasonYear - 1)
      if (previous.length > 0) {
        standings = previous
        standingsSeason = { label: seasonLabel(seasonYear - 1), isCurrent: false }
      }
    }

    let { topScorers, topAssisters } = currentLeaders
    let leadersSeason: SeasonInfo | null = topScorers.length > 0 ? { label: seasonLabel(seasonYear), isCurrent: true } : null
    if (topScorers.length === 0) {
      const previous = await fetchLeadersForSeason(seasonYear - 1)
      if (previous.topScorers.length > 0) {
        topScorers = previous.topScorers
        topAssisters = previous.topAssisters
        leadersSeason = { label: seasonLabel(seasonYear - 1), isCurrent: false }
      }
    }

    // Only show current-season form on a current-season standings table
    if (standingsSeason?.isCurrent) {
      for (const entry of standings) {
        entry.form = calculateForm(entry.club.id, formMatches)
      }
    }

    // 6. Assign ESPN channels based on match importance per timeslot
    const enrichedMatches = assignChannels(allMatches, standings)

    // Rebuild matchweeks with channel-enriched matches
    const enrichedMatchweeks = matchweeks.map((mw) => ({
      ...mw,
      matches: mw.matches.map((m) => enrichedMatches.find((em) => em.id === m.id) ?? m),
    }))

    return { matchweeks: enrichedMatchweeks, standings, allMatches: enrichedMatches, topScorers, topAssisters, standingsSeason, leadersSeason }
  } catch (error) {
    console.error('Failed to fetch Eredivisie data:', error)
    return { matchweeks: [], standings: [], allMatches: [], topScorers: [], topAssisters: [], standingsSeason: null, leadersSeason: null }
  }
}
