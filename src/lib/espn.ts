import { Match, MatchEvent, Matchweek, StandingEntry, Odds, TopScorer, TopAssister, FormResult, SeasonInfo, EredivisieData, Club } from '@/data/types'
import { formatDateRange } from '@/lib/utils'

const ESPN_API = 'https://site.api.espn.com/apis'
const LEAGUE = 'ned.1'
const REVALIDATE = 3600 // standings and leaders: 1 hour
const REVALIDATE_LIVE = 300 // current and upcoming months: 5 minutes, keeps live scores fresh
const REVALIDATE_PAST = 86400 // months fully in the past: 1 day

// --- ESPN API response types ---

interface ESPNTeam {
  id: string
  displayName: string
  shortDisplayName?: string
  abbreviation: string
  color?: string
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

interface ESPNDetail {
  type: { id: string; text: string }
  clock?: { displayValue: string }
  team?: { id: string }
  scoringPlay?: boolean
  redCard?: boolean
  yellowCard?: boolean
  penaltyKick?: boolean
  ownGoal?: boolean
  athletesInvolved?: Array<{ displayName: string }>
}

interface ESPNEvent {
  id: string
  date: string
  name: string
  competitions: Array<{
    competitors: ESPNCompetitor[]
    status: {
      displayClock?: string
      type: {
        name: string
        state: string
        completed: boolean
      }
    }
    venue?: { fullName?: string; address?: { city?: string } }
    odds?: ESPNOdds[]
    details?: ESPNDetail[]
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

const TZ = 'Europe/Amsterdam'

function amsterdamDateKey(dateStr: string): string {
  return new Intl.DateTimeFormat('sv-SE', { timeZone: TZ }).format(new Date(dateStr))
}

function monthParam(date: Date): string {
  return `${date.getUTCFullYear()}${String(date.getUTCMonth() + 1).padStart(2, '0')}`
}

// ESPN no longer accepts `dates=YYYYMMDD-YYYYMMDD` ranges on the scoreboard
// endpoint (HTTP 400 "Failed to get events endpoint"). Whole months
// (`dates=YYYYMM`) still work, so fetch each month in the window and merge.
function monthsBetween(from: Date, to: Date): string[] {
  const months: string[] = []
  const cursor = new Date(Date.UTC(from.getUTCFullYear(), from.getUTCMonth(), 1))
  while (cursor <= to) {
    months.push(monthParam(cursor))
    cursor.setUTCMonth(cursor.getUTCMonth() + 1)
  }
  return months
}

async function fetchScoreboardMonth(month: string): Promise<ESPNEvent[]> {
  const url = `${ESPN_API}/site/v2/sports/soccer/${LEAGUE}/scoreboard?dates=${month}&limit=200`
  const isPast = month < monthParam(new Date())
  try {
    const res = await fetch(url, { next: { revalidate: isPast ? REVALIDATE_PAST : REVALIDATE_LIVE } })
    if (!res.ok) {
      console.error(`ESPN scoreboard ${month} failed: ${res.status}`)
      return []
    }
    const data: ESPNScoreboardResponse = await res.json()
    return data.events ?? []
  } catch (error) {
    console.error(`ESPN scoreboard ${month} failed:`, error)
    return []
  }
}

async function fetchEventsBetween(from: Date, to: Date): Promise<ESPNEvent[]> {
  const perMonth = await Promise.all(monthsBetween(from, to).map(fetchScoreboardMonth))
  const seen = new Set<string>()
  const events: ESPNEvent[] = []
  for (const event of perMonth.flat()) {
    if (seen.has(event.id)) continue
    seen.add(event.id)
    const date = new Date(event.date)
    if (date >= from && date <= to) events.push(event)
  }
  return events.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
}

// --- Match day grouping ---
// ESPN carries no round numbers for soccer and its calendar only lists a
// subset of dates, so group matches into "speelrondes" by clustering
// consecutive match days (Fri/Sat/Sun weekends, Tue/Wed midweeks). A cluster
// with a full programme counts as a round; smaller clusters are rescheduled
// catch-up matches and do not advance the round counter.

const FULL_ROUND_MIN_MATCHES = 5

function groupIntoMatchweeks(matches: Match[]): Matchweek[] {
  const sorted = [...matches].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
  const groups: Match[][] = []

  for (const match of sorted) {
    const last = groups[groups.length - 1]
    if (last) {
      const prevKey = amsterdamDateKey(last[last.length - 1].date)
      const curKey = amsterdamDateKey(match.date)
      const gapDays = (Date.parse(curKey) - Date.parse(prevKey)) / 86_400_000
      if (gapDays <= 1) {
        last.push(match)
        continue
      }
    }
    groups.push([match])
  }

  let round = 0
  return groups.map((group, i) => {
    const isCatchUp = group.length < FULL_ROUND_MIN_MATCHES
    if (!isCatchUp) round++
    const roundNumber = isCatchUp ? undefined : round
    for (const m of group) m.round = roundNumber
    return {
      number: i + 1,
      round: roundNumber,
      isCatchUp,
      label: formatDateRange(group[0].date, group[group.length - 1].date),
      matches: group,
    }
  })
}

// --- Club helpers ---

export function slugify(name: string): string {
  return name
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

export function uniqueClubs(matches: Match[]): Club[] {
  const map = new Map<string, Club>()
  for (const m of matches) {
    map.set(m.homeTeam.id, m.homeTeam)
    map.set(m.awayTeam.id, m.awayTeam)
  }
  return [...map.values()].sort((a, b) => a.name.localeCompare(b.name, 'nl'))
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

function transformClub(team: ESPNTeam): Club {
  return {
    id: team.id,
    slug: slugify(team.displayName),
    name: team.displayName,
    shortName: team.shortDisplayName ?? team.abbreviation,
    logo: getTeamLogo(team),
    color: team.color,
  }
}

function transformDetails(details: ESPNDetail[] | undefined): MatchEvent[] | undefined {
  if (!details?.length) return undefined
  const events: MatchEvent[] = []
  for (const d of details) {
    let type: MatchEvent['type'] | null = null
    if (d.scoringPlay) type = d.ownGoal ? 'own-goal' : d.penaltyKick ? 'penalty' : 'goal'
    else if (d.redCard) type = 'red'
    else if (d.yellowCard) type = 'yellow'
    if (!type || !d.team?.id) continue
    events.push({
      minute: d.clock?.displayValue ?? '',
      type,
      teamId: d.team.id,
      player: d.athletesInvolved?.[0]?.displayName ?? '',
    })
  }
  return events.length > 0 ? events : undefined
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
    homeTeam: transformClub(home.team),
    awayTeam: transformClub(away.team),
    date: event.date,
    status,
    clock: status === 'live' ? comp.status.displayClock : undefined,
    score:
      status !== 'scheduled'
        ? { home: parseInt(home.score) || 0, away: parseInt(away.score) || 0 }
        : undefined,
    venue: comp.venue?.fullName,
    city: comp.venue?.address?.city,
    events: status !== 'scheduled' ? transformDetails(comp.details) : undefined,
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
        club: transformClub(entry.team),
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
  try {
    const res = await fetch(url, { next: { revalidate: REVALIDATE } })
    if (!res.ok) return { topScorers: [], topAssisters: [] }
    return transformLeaders(await res.json())
  } catch (error) {
    console.error('ESPN leaders failed:', error)
    return { topScorers: [], topAssisters: [] }
  }
}

async function fetchStandingsForSeason(year: number): Promise<StandingEntry[]> {
  const url = `${ESPN_API}/v2/sports/soccer/${LEAGUE}/standings?season=${year}`
  try {
    const res = await fetch(url, { next: { revalidate: REVALIDATE } })
    if (!res.ok) return []
    return transformStandings(await res.json())
  } catch (error) {
    console.error('ESPN standings failed:', error)
    return []
  }
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

async function fetchSeasonYear(): Promise<number> {
  const now = new Date()
  const fallback = now.getUTCMonth() >= 6 ? now.getUTCFullYear() : now.getUTCFullYear() - 1
  try {
    const res = await fetch(`${ESPN_API}/site/v2/sports/soccer/${LEAGUE}/scoreboard`, { next: { revalidate: REVALIDATE } })
    if (!res.ok) return fallback
    const data: ESPNScoreboardResponse = await res.json()
    return data.leagues?.[0]?.season?.year ?? fallback
  } catch (error) {
    console.error('ESPN season lookup failed:', error)
    return fallback
  }
}

const DAYS_AHEAD = 42 // ~6 rounds ahead, bridges international and winter breaks

export async function fetchEredivisieData(): Promise<EredivisieData> {
  const seasonYear = await fetchSeasonYear()

  // Whole season so far (Eredivisie starts in August; July is a safe lower
  // bound) plus the upcoming weeks. Past months are cached for a day, so
  // this is only a handful of live requests per revalidation.
  const from = new Date(Date.UTC(seasonYear, 6, 1))
  const to = new Date()
  to.setUTCDate(to.getUTCDate() + DAYS_AHEAD)

  // Every feed is fetched independently so one failing endpoint never
  // empties the whole page.
  const [events, currentStandings, currentLeaders] = await Promise.all([
    fetchEventsBetween(from, to),
    fetchStandingsForSeason(seasonYear),
    fetchLeadersForSeason(seasonYear),
  ])

  const allMatches = events.map(transformEvent)

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
      entry.form = calculateForm(entry.club.id, allMatches)
    }
  }

  const enrichedMatches = assignChannels(allMatches, standings)
  const matchweeks = groupIntoMatchweeks(enrichedMatches)
  const clubs = uniqueClubs(enrichedMatches)

  return { seasonYear, matchweeks, standings, allMatches: enrichedMatches, clubs, topScorers, topAssisters, standingsSeason, leadersSeason }
}

// Convenience lookups for detail pages
export async function findClubBySlug(slug: string): Promise<{ club: Club; data: EredivisieData } | null> {
  const data = await fetchEredivisieData()
  const club = data.clubs.find((c) => c.slug === slug)
  return club ? { club, data } : null
}

export async function findMatchById(id: string): Promise<{ match: Match; data: EredivisieData } | null> {
  const data = await fetchEredivisieData()
  const match = data.allMatches.find((m) => m.id === id)
  return match ? { match, data } : null
}
