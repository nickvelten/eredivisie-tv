export type Club = {
  id: string
  name: string
  shortName: string
  logo: string
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

export type Match = {
  id: string
  homeTeam: Club
  awayTeam: Club
  date: string
  status: 'scheduled' | 'live' | 'finished'
  score?: { home: number; away: number }
  broadcasts: Broadcast[]
  odds?: Odds
}

export type Matchweek = {
  number: number
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
