export type Club = {
  id: string
  slug: string // URL-safe, e.g. "feyenoord-rotterdam"
  name: string
  shortName: string // e.g. "Feyenoord"
  logo: string
  color?: string // hex without #, from ESPN
}

export type Broadcast = {
  name: string
  type: 'tv' | 'online' | 'app'
  url?: string
}

export type Odds = {
  home: number // decimal odds, e.g. 1.53
  draw: number
  away: number
}

export type MatchEvent = {
  minute: string // e.g. "45'+2'"
  type: 'goal' | 'own-goal' | 'penalty' | 'yellow' | 'red'
  teamId: string
  player: string
}

export type Match = {
  id: string
  homeTeam: Club
  awayTeam: Club
  date: string
  status: 'scheduled' | 'live' | 'finished'
  clock?: string // live match clock, e.g. "67'"
  score?: { home: number; away: number }
  venue?: string
  city?: string
  round?: number
  broadcasts: Broadcast[]
  odds?: Odds
  events?: MatchEvent[]
}

export type Matchweek = {
  number: number // sequential index within the fetched window
  round?: number // official round number (undefined for catch-up clusters)
  isCatchUp: boolean // rescheduled matches outside a full round
  label: string // e.g. "vr 18 – zo 20 september"
  matches: Match[]
}

export type FormResult = 'W' | 'D' | 'L'

export type StandingEntry = {
  position: number
  club: Club
  played: number
  won: number
  drawn: number
  lost: number
  goalsFor: number
  goalsAgainst: number
  points: number
  form?: FormResult[]
}

export type TopScorer = {
  position: number
  name: string
  goals: number
  matches: number
  flag?: string
}

export type TopAssister = {
  position: number
  name: string
  assists: number
  matches: number
  flag?: string
}

export type SeasonInfo = {
  label: string // e.g. "2026/27"
  isCurrent: boolean // false when showing previous-season data as fallback
}

export type Provider = {
  name: string
  logo: string
  brandColor: string
  price: string
  description: string
  url: string
  channels: string[]
}

export type EredivisieData = {
  seasonYear: number
  matchweeks: Matchweek[]
  standings: StandingEntry[]
  allMatches: Match[]
  clubs: Club[]
  topScorers: TopScorer[]
  topAssisters: TopAssister[]
  standingsSeason: SeasonInfo | null
  leadersSeason: SeasonInfo | null
}
