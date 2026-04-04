# Eredivisie.tv v2 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Evolve eredivisie.tv from a single-page app to a multi-page site with live scores, club pages, match detail pages, favourite club support, and expanded SEO.

**Architecture:** Next.js 16 App Router with ISR for SEO + client-side polling for live scores. ESPN public API as sole data source. localStorage for favourite club persistence. Dynamic OG images via `next/og`.

**Tech Stack:** Next.js 16, React 19, TypeScript, Tailwind CSS 4, ESPN API, `next/og`

---

## File Map

### New files
```
src/app/programma/page.tsx              — Match schedule page
src/app/uitslagen/page.tsx              — Results page
src/app/stand/page.tsx                  — Standings page
src/app/topscorers/page.tsx             — Top scorers page
src/app/club/[slug]/page.tsx            — Club detail page
src/app/club/[slug]/opengraph-image.tsx — Dynamic OG image for club
src/app/wedstrijd/[id]/page.tsx         — Match detail page
src/app/wedstrijd/[id]/opengraph-image.tsx — Dynamic OG image for match
src/app/kijken/page.tsx                 — Provider comparison page
src/app/api/scores/route.ts             — Live score polling endpoint
src/app/opengraph-image.tsx             — Homepage OG image
src/app/stand/opengraph-image.tsx       — Standings OG image
src/components/LiveScoreProvider.tsx     — Client context for live score polling
src/components/FavoriteClubProvider.tsx  — Client context for favourite club
src/components/FavoriteClubSelector.tsx  — Dropdown in header to pick favourite club
src/components/ClubFilter.tsx           — Toggle to filter by favourite club
src/components/Countdown.tsx            — Countdown timer to next match
src/components/BackToTop.tsx            — Floating back-to-top button
src/components/Breadcrumb.tsx           — Breadcrumb navigation
src/components/ComparisonTable.tsx      — Provider comparison table
src/components/FAQ.tsx                  — FAQ section with structured data
src/lib/espn-fetchers.ts               — Split ESPN fetch functions
src/data/club-mapping.ts               — ESPN ID ↔ slug mapping
```

### Modified files
```
src/app/layout.tsx                      — Add FavoriteClubProvider, update nav
src/app/page.tsx                        — Rewrite as compact hub
src/app/sitemap.ts                      — Add all dynamic routes
src/data/types.ts                       — Add slug to Club type
src/data/clubs.ts                       — Add slugs, update to 2025/26 clubs
src/components/Header.tsx               — Page-based nav + favourite club selector
src/components/MatchCard.tsx            — Wrap with LiveScoreProvider, link to /wedstrijd
src/components/Standings.tsx            — Highlight favourite club, link to /club
src/components/Results.tsx              — Link to /wedstrijd, add filter
src/components/MatchSchedule.tsx        — Link to /wedstrijd, add filter
src/components/TopScorers.tsx           — Standalone version for /topscorers
src/components/TodayHighlight.tsx       — Add countdown, wrap with live scores
src/components/Providers.tsx            — Move to /kijken, keep compact version for reference
```

---

## Task 1: Data Layer — Club Mapping & Updated Types

**Files:**
- Modify: `src/data/types.ts`
- Create: `src/data/club-mapping.ts`
- Modify: `src/data/clubs.ts`

- [ ] **Step 1: Add `slug` to Club type**

In `src/data/types.ts`, add `slug` field to the `Club` type:

```ts
export type Club = {
  id: string
  slug?: string // URL slug for club pages — only set on enriched clubs
  name: string
  shortName: string
  logo: string
}
```

We use `slug?` (optional) because ESPN API returns Club objects without slugs — the slug is added via mapping.

- [ ] **Step 2: Create ESPN ID to slug mapping**

Create `src/data/club-mapping.ts`:

```ts
// Maps ESPN team IDs to URL slugs for club pages
// Updated for 2025/26 Eredivisie season
export const espnIdToSlug: Record<string, string> = {
  '139': 'ajax',
  '140': 'az',
  '141': 'nac',
  '142': 'feyenoord',
  '143': 'fortuna',
  '145': 'groningen',
  '146': 'heerenveen',
  '147': 'nec',
  '148': 'psv',
  '151': 'sparta',
  '152': 'twente',
  '153': 'utrecht',
  '2565': 'pec',
  '2566': 'excelsior',
  '2727': 'volendam',
  '3706': 'goahead',
  '3708': 'heracles',
  '3735': 'telstar',
}

export const slugToEspnId: Record<string, string> = Object.fromEntries(
  Object.entries(espnIdToSlug).map(([k, v]) => [v, k])
)

// Human-readable names for slugs (used in metadata)
export const slugToDisplayName: Record<string, string> = {
  ajax: 'Ajax',
  az: 'AZ',
  nac: 'NAC Breda',
  feyenoord: 'Feyenoord',
  fortuna: 'Fortuna Sittard',
  groningen: 'FC Groningen',
  heerenveen: 'sc Heerenveen',
  nec: 'NEC',
  psv: 'PSV',
  sparta: 'Sparta Rotterdam',
  twente: 'FC Twente',
  utrecht: 'FC Utrecht',
  pec: 'PEC Zwolle',
  excelsior: 'Excelsior',
  volendam: 'FC Volendam',
  goahead: 'Go Ahead Eagles',
  heracles: 'Heracles Almelo',
  telstar: 'Telstar',
}

export function enrichClubWithSlug(club: { id: string; name: string; shortName: string; logo: string }): { id: string; slug?: string; name: string; shortName: string; logo: string } {
  return {
    ...club,
    slug: espnIdToSlug[club.id],
  }
}
```

- [ ] **Step 3: Update clubs.ts with slugs and current season clubs**

Replace `src/data/clubs.ts` contents:

```ts
import { Club } from './types'

// Static club data — used for fallback/reference
// Live data comes from ESPN API; this maps known slugs
export const clubs: Record<string, Club> = {
  ajax: { id: '139', slug: 'ajax', name: 'Ajax', shortName: 'AJA', logo: '/clubs/ajax.png' },
  feyenoord: { id: '142', slug: 'feyenoord', name: 'Feyenoord', shortName: 'FEY', logo: '/clubs/feyenoord.png' },
  psv: { id: '148', slug: 'psv', name: 'PSV', shortName: 'PSV', logo: '/clubs/psv.png' },
  az: { id: '140', slug: 'az', name: 'AZ', shortName: 'AZ', logo: '/clubs/az.png' },
  twente: { id: '152', slug: 'twente', name: 'FC Twente', shortName: 'TWE', logo: '/clubs/twente.png' },
  utrecht: { id: '153', slug: 'utrecht', name: 'FC Utrecht', shortName: 'UTR', logo: '/clubs/utrecht.png' },
  groningen: { id: '145', slug: 'groningen', name: 'FC Groningen', shortName: 'GRO', logo: '/clubs/groningen.png' },
  heerenveen: { id: '146', slug: 'heerenveen', name: 'sc Heerenveen', shortName: 'HEE', logo: '/clubs/heerenveen.png' },
  sparta: { id: '151', slug: 'sparta', name: 'Sparta Rotterdam', shortName: 'SPA', logo: '/clubs/sparta.png' },
  nac: { id: '141', slug: 'nac', name: 'NAC Breda', shortName: 'NAC', logo: '/clubs/nac.png' },
  nec: { id: '147', slug: 'nec', name: 'NEC', shortName: 'NEC', logo: '/clubs/nec.png' },
  goahead: { id: '3706', slug: 'goahead', name: 'Go Ahead Eagles', shortName: 'GAE', logo: '/clubs/goahead.png' },
  heracles: { id: '3708', slug: 'heracles', name: 'Heracles Almelo', shortName: 'HER', logo: '/clubs/heracles.png' },
  fortuna: { id: '143', slug: 'fortuna', name: 'Fortuna Sittard', shortName: 'FOR', logo: '/clubs/fortuna.png' },
  pec: { id: '2565', slug: 'pec', name: 'PEC Zwolle', shortName: 'PEC', logo: '/clubs/pec.png' },
  excelsior: { id: '2566', slug: 'excelsior', name: 'Excelsior', shortName: 'EXC', logo: '/clubs/excelsior.png' },
  volendam: { id: '2727', slug: 'volendam', name: 'FC Volendam', shortName: 'VOL', logo: '/clubs/volendam.png' },
  telstar: { id: '3735', slug: 'telstar', name: 'Telstar', shortName: 'TEL', logo: '/clubs/telstar.png' },
}
```

- [ ] **Step 4: Commit**

```bash
git add src/data/types.ts src/data/club-mapping.ts src/data/clubs.ts
git commit -m "feat: add club slug mapping and update to 2025/26 season"
```

---

## Task 2: Split ESPN Fetch Functions

**Files:**
- Create: `src/lib/espn-fetchers.ts`
- Modify: `src/lib/espn.ts`

- [ ] **Step 1: Create focused fetch functions**

Create `src/lib/espn-fetchers.ts`. This file provides per-page fetch functions so each page only loads what it needs. The functions reuse the same ESPN API endpoints and transformation logic from `espn.ts`.

```ts
import { Match, Matchweek, StandingEntry, TopScorer, TopAssister } from '@/data/types'
import { enrichClubWithSlug } from '@/data/club-mapping'

const ESPN_API = 'https://site.api.espn.com/apis'
const LEAGUE = 'ned.1'
const REVALIDATE = 3600

// Re-export the full fetch for pages that need everything
export { fetchEredivisieData } from './espn'

// --- Standings only ---
export async function fetchStandings(): Promise<StandingEntry[]> {
  try {
    const res = await fetch(`${ESPN_API}/v2/sports/soccer/${LEAGUE}/standings`, {
      next: { revalidate: REVALIDATE },
    })
    if (!res.ok) return []
    const data = await res.json()
    const entries = data.children?.[0]?.standings?.entries ?? []

    return entries
      .map((entry: any) => {
        const stat = (name: string) => entry.stats.find((s: any) => s.name === name)?.value ?? 0
        return {
          position: 0,
          club: enrichClubWithSlug({
            id: entry.team.id,
            name: entry.team.displayName,
            shortName: entry.team.abbreviation,
            logo: entry.team.logo || entry.team.logos?.[0]?.href || `https://a.espncdn.com/i/teamlogos/soccer/500/${entry.team.id}.png`,
          }),
          played: stat('gamesPlayed'),
          won: stat('wins'),
          drawn: stat('ties'),
          lost: stat('losses'),
          goalsFor: stat('pointsFor'),
          goalsAgainst: stat('pointsAgainst'),
          points: stat('points'),
        }
      })
      .sort((a: StandingEntry, b: StandingEntry) => b.points - a.points || (b.goalsFor - b.goalsAgainst) - (a.goalsFor - a.goalsAgainst))
      .map((entry: StandingEntry, i: number) => ({ ...entry, position: i + 1 }))
  } catch {
    return []
  }
}

// --- Leaders only ---
export async function fetchLeaders(): Promise<{ topScorers: TopScorer[]; topAssisters: TopAssister[] }> {
  try {
    const res = await fetch(`${ESPN_API}/site/v3/sports/soccer/${LEAGUE}/leaders?season=2025&seasontype=1`, {
      next: { revalidate: REVALIDATE },
    })
    if (!res.ok) return { topScorers: [], topAssisters: [] }
    const data = await res.json()
    const categories = data.leaders?.categories ?? []

    const goalsCategory = categories.find((c: any) => c.name === 'goalsLeaders') ?? categories.find((c: any) => c.name === 'goals')
    const assistsCategory = categories.find((c: any) => c.name === 'assistsLeaders') ?? categories.find((c: any) => c.name === 'assists')

    const topScorers: TopScorer[] = (goalsCategory?.leaders ?? []).slice(0, 15).map((l: any, i: number) => {
      const matchesMatch = l.displayValue.match(/Matches:\s*(\d+)/)
      return {
        position: i + 1,
        name: l.athlete.displayName,
        goals: Math.round(l.value),
        matches: matchesMatch ? parseInt(matchesMatch[1]) : 0,
        flag: l.athlete.flag?.href,
      }
    })

    const topAssisters: TopAssister[] = (assistsCategory?.leaders ?? []).slice(0, 15).map((l: any, i: number) => {
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
  } catch {
    return { topScorers: [], topAssisters: [] }
  }
}

// --- Live scores (minimal payload for polling) ---
export async function fetchLiveScores(): Promise<{ id: string; status: Match['status']; score?: { home: number; away: number } }[]> {
  try {
    const res = await fetch(`${ESPN_API}/site/v2/sports/soccer/${LEAGUE}/scoreboard`, {
      cache: 'no-store',
    })
    if (!res.ok) return []
    const data = await res.json()

    return (data.events ?? []).map((event: any) => {
      const comp = event.competitions[0]
      const home = comp.competitors.find((c: any) => c.homeAway === 'home')
      const away = comp.competitors.find((c: any) => c.homeAway === 'away')
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
        status,
        score: status !== 'scheduled' ? {
          home: parseInt(home?.score) || 0,
          away: parseInt(away?.score) || 0,
        } : undefined,
      }
    })
  } catch {
    return []
  }
}

// --- Single match by ID ---
export async function fetchMatchById(id: string): Promise<Match | null> {
  try {
    const res = await fetch(`${ESPN_API}/site/v2/sports/soccer/${LEAGUE}/summary?event=${id}`, {
      next: { revalidate: 300 },
    })
    if (!res.ok) return null
    const data = await res.json()

    const header = data.header
    if (!header) return null

    const comp = header.competitions?.[0]
    if (!comp) return null

    const home = comp.competitors?.find((c: any) => c.homeAway === 'home')
    const away = comp.competitors?.find((c: any) => c.homeAway === 'away')
    if (!home || !away) return null

    const statusName = comp.status?.type?.name ?? ''
    const state = comp.status?.type?.state ?? ''
    let status: Match['status'] = 'scheduled'
    if (comp.status?.type?.completed || statusName === 'STATUS_FULL_TIME' || statusName === 'STATUS_FINAL') {
      status = 'finished'
    } else if (state === 'in') {
      status = 'live'
    }

    return {
      id: id,
      homeTeam: enrichClubWithSlug({
        id: home.team.id,
        name: home.team.displayName,
        shortName: home.team.abbreviation,
        logo: home.team.logos?.[0]?.href || `https://a.espncdn.com/i/teamlogos/soccer/500/${home.team.id}.png`,
      }),
      awayTeam: enrichClubWithSlug({
        id: away.team.id,
        name: away.team.displayName,
        shortName: away.team.abbreviation,
        logo: away.team.logos?.[0]?.href || `https://a.espncdn.com/i/teamlogos/soccer/500/${away.team.id}.png`,
      }),
      date: header.gameDate ?? comp.date ?? new Date().toISOString(),
      status,
      score: status !== 'scheduled' ? {
        home: parseInt(home.score) || 0,
        away: parseInt(away.score) || 0,
      } : undefined,
      broadcasts: [
        { name: 'ESPN', type: 'tv' },
        { name: 'ESPN.nl', type: 'online', url: 'https://www.espn.nl' },
      ],
    }
  } catch {
    return null
  }
}

// --- All matches for a club (by ESPN team ID) ---
export async function fetchClubMatches(espnTeamId: string): Promise<{ upcoming: Match[]; recent: Match[] }> {
  try {
    // Fetch full scoreboard with wide date range to get club's matches
    const now = new Date()
    const start = new Date(now)
    start.setMonth(start.getMonth() - 3)
    const end = new Date(now)
    end.setMonth(end.getMonth() + 2)
    const fmt = (d: Date) => d.toISOString().slice(0, 10).replace(/-/g, '')

    const res = await fetch(
      `${ESPN_API}/site/v2/sports/soccer/${LEAGUE}/scoreboard?dates=${fmt(start)}-${fmt(end)}&limit=400`,
      { next: { revalidate: REVALIDATE } }
    )
    if (!res.ok) return { upcoming: [], recent: [] }
    const data = await res.json()

    const allMatches: Match[] = (data.events ?? [])
      .map((event: any) => {
        const comp = event.competitions[0]
        const home = comp.competitors.find((c: any) => c.homeAway === 'home')
        const away = comp.competitors.find((c: any) => c.homeAway === 'away')
        if (!home || !away) return null

        // Only include matches involving this team
        if (home.team.id !== espnTeamId && away.team.id !== espnTeamId) return null

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
          homeTeam: enrichClubWithSlug({
            id: home.team.id,
            name: home.team.displayName,
            shortName: home.team.abbreviation,
            logo: home.team.logos?.[0]?.href || `https://a.espncdn.com/i/teamlogos/soccer/500/${home.team.id}.png`,
          }),
          awayTeam: enrichClubWithSlug({
            id: away.team.id,
            name: away.team.displayName,
            shortName: away.team.abbreviation,
            logo: away.team.logos?.[0]?.href || `https://a.espncdn.com/i/teamlogos/soccer/500/${away.team.id}.png`,
          }),
          date: event.date,
          status,
          score: status !== 'scheduled' ? {
            home: parseInt(home.score) || 0,
            away: parseInt(away.score) || 0,
          } : undefined,
          broadcasts: [
            { name: 'ESPN', type: 'tv' as const },
            { name: 'ESPN.nl', type: 'online' as const, url: 'https://www.espn.nl' },
          ],
        } as Match
      })
      .filter(Boolean) as Match[]

    const sorted = allMatches.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    const recent = sorted.filter((m) => m.status === 'finished').slice(-5).reverse()
    const upcoming = sorted.filter((m) => m.status === 'scheduled' || m.status === 'live').slice(0, 5)

    return { upcoming, recent }
  } catch {
    return { upcoming: [], recent: [] }
  }
}
```

- [ ] **Step 2: Update espn.ts to enrich clubs with slugs**

In `src/lib/espn.ts`, add slug enrichment to `transformEvent` and `transformStandings`. At the top, add the import:

```ts
import { enrichClubWithSlug } from '@/data/club-mapping'
```

In the `transformEvent` function, wrap the homeTeam and awayTeam objects:

```ts
// Replace the return statement's homeTeam/awayTeam with:
homeTeam: enrichClubWithSlug({
  id: home.team.id,
  name: home.team.displayName,
  shortName: home.team.abbreviation,
  logo: getTeamLogo(home.team),
}),
awayTeam: enrichClubWithSlug({
  id: away.team.id,
  name: away.team.displayName,
  shortName: away.team.abbreviation,
  logo: getTeamLogo(away.team),
}),
```

In `transformStandings`, wrap the club object similarly:

```ts
club: enrichClubWithSlug({
  id: entry.team.id,
  name: entry.team.displayName,
  shortName: entry.team.abbreviation,
  logo: getTeamLogo(entry.team),
}),
```

- [ ] **Step 3: Verify build works**

```bash
cd /Users/nickvelten/Projects/eredivisie-tv && npm run build
```

Expected: Build succeeds with no type errors.

- [ ] **Step 4: Commit**

```bash
git add src/lib/espn-fetchers.ts src/lib/espn.ts
git commit -m "feat: split ESPN fetchers and add slug enrichment"
```

---

## Task 3: Live Score Polling — API Route & Client Provider

**Files:**
- Create: `src/app/api/scores/route.ts`
- Create: `src/components/LiveScoreProvider.tsx`

- [ ] **Step 1: Create the API route**

Create `src/app/api/scores/route.ts`:

```ts
import { fetchLiveScores } from '@/lib/espn-fetchers'

export const dynamic = 'force-dynamic'

export async function GET() {
  const scores = await fetchLiveScores()
  return Response.json({ scores }, {
    headers: {
      'Cache-Control': 'public, s-maxage=30, stale-while-revalidate=10',
    },
  })
}
```

- [ ] **Step 2: Create LiveScoreProvider**

Create `src/components/LiveScoreProvider.tsx`:

```tsx
'use client'

import { createContext, useContext, useEffect, useState, useCallback, type ReactNode } from 'react'

type LiveScore = {
  id: string
  status: 'scheduled' | 'live' | 'finished'
  score?: { home: number; away: number }
}

type LiveScoreContextType = {
  scores: Map<string, LiveScore>
  isPolling: boolean
}

const LiveScoreContext = createContext<LiveScoreContextType>({
  scores: new Map(),
  isPolling: false,
})

export function useLiveScores() {
  return useContext(LiveScoreContext)
}

export function useLiveScore(matchId: string) {
  const { scores } = useLiveScores()
  return scores.get(matchId)
}

export function LiveScoreProvider({
  children,
  hasLiveMatches: initialHasLive = false,
}: {
  children: ReactNode
  hasLiveMatches?: boolean
}) {
  const [scores, setScores] = useState<Map<string, LiveScore>>(new Map())
  const [isPolling, setIsPolling] = useState(false)

  const fetchScores = useCallback(async () => {
    try {
      const res = await fetch('/api/scores')
      if (!res.ok) return
      const data = await res.json()
      const map = new Map<string, LiveScore>()
      for (const s of data.scores) {
        map.set(s.id, s)
      }
      setScores(map)

      // Check if any match is live or starting within 30 min
      const hasLive = data.scores.some(
        (s: LiveScore) => s.status === 'live'
      )
      setIsPolling(hasLive || initialHasLive)
    } catch {
      // Silently fail — stale data is fine
    }
  }, [initialHasLive])

  useEffect(() => {
    // Initial fetch
    fetchScores()

    // Poll every 30 seconds if there are live matches
    const interval = setInterval(() => {
      fetchScores()
    }, 30_000)

    return () => clearInterval(interval)
  }, [fetchScores])

  return (
    <LiveScoreContext.Provider value={{ scores, isPolling }}>
      {children}
    </LiveScoreContext.Provider>
  )
}
```

- [ ] **Step 3: Verify build**

```bash
cd /Users/nickvelten/Projects/eredivisie-tv && npm run build
```

- [ ] **Step 4: Commit**

```bash
git add src/app/api/scores/route.ts src/components/LiveScoreProvider.tsx
git commit -m "feat: add live score polling API route and client provider"
```

---

## Task 4: Favourite Club — Context Provider & Selector

**Files:**
- Create: `src/components/FavoriteClubProvider.tsx`
- Create: `src/components/FavoriteClubSelector.tsx`
- Create: `src/components/ClubFilter.tsx`

- [ ] **Step 1: Create FavoriteClubProvider**

Create `src/components/FavoriteClubProvider.tsx`:

```tsx
'use client'

import { createContext, useContext, useState, useEffect, type ReactNode } from 'react'

type FavoriteClubContextType = {
  favoriteSlug: string | null
  setFavoriteSlug: (slug: string | null) => void
}

const FavoriteClubContext = createContext<FavoriteClubContextType>({
  favoriteSlug: null,
  setFavoriteSlug: () => {},
})

export function useFavoriteClub() {
  return useContext(FavoriteClubContext)
}

const STORAGE_KEY = 'eredivisie-favorite-club'

export function FavoriteClubProvider({ children }: { children: ReactNode }) {
  const [favoriteSlug, setFavoriteSlugState] = useState<string | null>(null)
  const [loaded, setLoaded] = useState(false)

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (stored) setFavoriteSlugState(stored)
    setLoaded(true)
  }, [])

  function setFavoriteSlug(slug: string | null) {
    setFavoriteSlugState(slug)
    if (slug) {
      localStorage.setItem(STORAGE_KEY, slug)
    } else {
      localStorage.removeItem(STORAGE_KEY)
    }
  }

  // Don't render until localStorage is read to avoid hydration mismatch
  if (!loaded) {
    return <FavoriteClubContext.Provider value={{ favoriteSlug: null, setFavoriteSlug }}>
      {children}
    </FavoriteClubContext.Provider>
  }

  return (
    <FavoriteClubContext.Provider value={{ favoriteSlug, setFavoriteSlug }}>
      {children}
    </FavoriteClubContext.Provider>
  )
}
```

- [ ] **Step 2: Create FavoriteClubSelector**

Create `src/components/FavoriteClubSelector.tsx`:

```tsx
'use client'

import { useFavoriteClub } from './FavoriteClubProvider'
import { espnIdToSlug, slugToDisplayName } from '@/data/club-mapping'

const clubOptions = Object.values(espnIdToSlug)
  .sort((a, b) => (slugToDisplayName[a] ?? a).localeCompare(slugToDisplayName[b] ?? b))

export function FavoriteClubSelector() {
  const { favoriteSlug, setFavoriteSlug } = useFavoriteClub()

  return (
    <select
      value={favoriteSlug ?? ''}
      onChange={(e) => setFavoriteSlug(e.target.value || null)}
      className="rounded-lg border border-black/10 bg-white px-2 py-1.5 text-xs font-medium text-muted transition-colors hover:border-accent/30 focus:border-accent focus:outline-none"
      aria-label="Kies je favoriete club"
    >
      <option value="">⭐ Mijn club</option>
      {clubOptions.map((slug) => (
        <option key={slug} value={slug}>
          {slugToDisplayName[slug] ?? slug}
        </option>
      ))}
    </select>
  )
}
```

- [ ] **Step 3: Create ClubFilter**

Create `src/components/ClubFilter.tsx`:

```tsx
'use client'

import { useFavoriteClub } from './FavoriteClubProvider'
import { slugToEspnId, slugToDisplayName } from '@/data/club-mapping'

export function ClubFilter({
  enabled,
  onToggle,
}: {
  enabled: boolean
  onToggle: (enabled: boolean) => void
}) {
  const { favoriteSlug } = useFavoriteClub()

  if (!favoriteSlug) return null

  const clubName = slugToDisplayName[favoriteSlug] ?? favoriteSlug

  return (
    <button
      onClick={() => onToggle(!enabled)}
      className={`rounded-full px-3 py-1.5 text-xs font-medium transition-all ${
        enabled
          ? 'bg-accent text-white shadow-sm'
          : 'bg-white text-muted ring-1 ring-black/5 hover:text-foreground'
      }`}
    >
      {enabled ? `✕ Alleen ${clubName}` : `Alleen ${clubName}`}
    </button>
  )
}

// Helper to filter matches by favourite club
export function filterByClub(
  matches: Array<{ homeTeam: { id: string }; awayTeam: { id: string } }>,
  favoriteSlug: string | null,
  filterEnabled: boolean
) {
  if (!filterEnabled || !favoriteSlug) return matches
  const espnId = slugToEspnId[favoriteSlug]
  if (!espnId) return matches
  return matches.filter((m) => m.homeTeam.id === espnId || m.awayTeam.id === espnId)
}
```

- [ ] **Step 4: Commit**

```bash
git add src/components/FavoriteClubProvider.tsx src/components/FavoriteClubSelector.tsx src/components/ClubFilter.tsx
git commit -m "feat: add favourite club context, selector, and filter"
```

---

## Task 5: Shared UI Components — Breadcrumb, BackToTop, Countdown

**Files:**
- Create: `src/components/Breadcrumb.tsx`
- Create: `src/components/BackToTop.tsx`
- Create: `src/components/Countdown.tsx`

- [ ] **Step 1: Create Breadcrumb**

Create `src/components/Breadcrumb.tsx`:

```tsx
import Link from 'next/link'

type BreadcrumbItem = {
  label: string
  href?: string
}

export function Breadcrumb({ items }: { items: BreadcrumbItem[] }) {
  return (
    <nav aria-label="Breadcrumb" className="mb-6 text-sm text-muted">
      <ol className="flex items-center gap-1.5">
        <li>
          <Link href="/" className="hover:text-accent transition-colors">Home</Link>
        </li>
        {items.map((item, i) => (
          <li key={i} className="flex items-center gap-1.5">
            <span className="text-muted-light">/</span>
            {item.href ? (
              <Link href={item.href} className="hover:text-accent transition-colors">{item.label}</Link>
            ) : (
              <span className="font-medium text-foreground">{item.label}</span>
            )}
          </li>
        ))}
      </ol>
    </nav>
  )
}
```

- [ ] **Step 2: Create BackToTop**

Create `src/components/BackToTop.tsx`:

```tsx
'use client'

import { useEffect, useState } from 'react'

export function BackToTop() {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    function onScroll() {
      setVisible(window.scrollY > 400)
    }
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  if (!visible) return null

  return (
    <button
      onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
      className="fixed bottom-6 right-6 z-40 rounded-full bg-accent p-3 text-white shadow-lg transition-all hover:bg-accent/90 hover:shadow-xl"
      aria-label="Terug naar boven"
    >
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M10 16V4M4 10l6-6 6 6" />
      </svg>
    </button>
  )
}
```

- [ ] **Step 3: Create Countdown**

Create `src/components/Countdown.tsx`:

```tsx
'use client'

import { useEffect, useState } from 'react'

export function Countdown({ targetDate }: { targetDate: string }) {
  const [timeLeft, setTimeLeft] = useState('')

  useEffect(() => {
    function update() {
      const diff = new Date(targetDate).getTime() - Date.now()
      if (diff <= 0) {
        setTimeLeft('Nu live!')
        return
      }
      const days = Math.floor(diff / (1000 * 60 * 60 * 24))
      const hours = Math.floor((diff / (1000 * 60 * 60)) % 24)
      const minutes = Math.floor((diff / (1000 * 60)) % 60)
      const seconds = Math.floor((diff / 1000) % 60)

      if (days > 0) {
        setTimeLeft(`${days}d ${hours}u ${minutes}m`)
      } else if (hours > 0) {
        setTimeLeft(`${hours}u ${minutes}m ${seconds}s`)
      } else {
        setTimeLeft(`${minutes}m ${seconds}s`)
      }
    }

    update()
    const interval = setInterval(update, 1000)
    return () => clearInterval(interval)
  }, [targetDate])

  if (!timeLeft) return null

  return (
    <span className="inline-flex items-center gap-1.5 rounded-full bg-accent/10 px-3 py-1 text-xs font-bold text-accent">
      <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-accent" />
      {timeLeft}
    </span>
  )
}
```

- [ ] **Step 4: Commit**

```bash
git add src/components/Breadcrumb.tsx src/components/BackToTop.tsx src/components/Countdown.tsx
git commit -m "feat: add breadcrumb, back-to-top, and countdown components"
```

---

## Task 6: Update Layout & Header — Multi-Page Navigation

**Files:**
- Modify: `src/app/layout.tsx`
- Modify: `src/components/Header.tsx`

- [ ] **Step 1: Update layout.tsx**

Replace `src/app/layout.tsx` to wrap with providers and add BackToTop:

```tsx
import type { Metadata } from 'next'
import { Geist, Geist_Mono } from 'next/font/google'
import { GoogleAnalytics } from '@next/third-parties/google'
import { FavoriteClubProvider } from '@/components/FavoriteClubProvider'
import { BackToTop } from '@/components/BackToTop'
import { Header } from '@/components/Header'
import './globals.css'

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
})

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
})

export const metadata: Metadata = {
  title: {
    default: 'Eredivisie.tv — Wedstrijden & TV Gids | Eredivisie op TV',
    template: '%s | Eredivisie.tv',
  },
  description:
    'Bekijk alle Eredivisie wedstrijden en ontdek waar je ze live kunt zien op TV en online. Compleet programma, uitslagen, stand en TV gids voor de Nederlandse Eredivisie.',
  keywords:
    'eredivisie, eredivisie tv, eredivisie op tv, voetbal op tv, eredivisie programma, eredivisie stand, eredivisie uitslagen, espn eredivisie, eredivisie live, eredivisie kijken',
  openGraph: {
    title: 'Eredivisie.tv — Wedstrijden & TV Gids',
    description:
      'Alle Eredivisie wedstrijden, uitslagen, stand en waar je ze kunt kijken op TV en online.',
    type: 'website',
    locale: 'nl_NL',
    url: 'https://eredivisie.tv',
    siteName: 'Eredivisie.tv',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Eredivisie.tv — Wedstrijden & TV Gids',
    description: 'Alle Eredivisie wedstrijden en waar je ze kunt kijken op TV en online.',
  },
  alternates: {
    canonical: 'https://eredivisie.tv',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
    },
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="nl" className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col bg-background">
        <FavoriteClubProvider>
          <Header />
          {children}
          <footer className="border-t border-black/5 bg-white py-8">
            <div className="mx-auto max-w-5xl px-4 text-center">
              <p className="text-sm font-medium text-muted mb-1">eredivisie.tv</p>
              <p className="text-xs text-muted-light">Niet officieel gelieerd aan de Eredivisie</p>
            </div>
          </footer>
          <BackToTop />
        </FavoriteClubProvider>
      </body>
      {process.env.NEXT_PUBLIC_GA_ID && <GoogleAnalytics gaId={process.env.NEXT_PUBLIC_GA_ID} />}
    </html>
  )
}
```

- [ ] **Step 2: Update Header.tsx for page-based nav**

Replace `src/components/Header.tsx`:

```tsx
'use client'

import Image from 'next/image'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { FavoriteClubSelector } from './FavoriteClubSelector'

const navItems = [
  { label: 'Programma', href: '/programma' },
  { label: 'Uitslagen', href: '/uitslagen' },
  { label: 'Stand', href: '/stand' },
  { label: 'Topscorers', href: '/topscorers' },
  { label: 'Kijken', href: '/kijken' },
]

export function Header() {
  const pathname = usePathname()

  return (
    <header className="sticky top-0 z-50 bg-white shadow-sm">
      <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-4 sm:px-5 sm:py-5">
        <Link href="/" className="flex items-center gap-3">
          <Image
            src="/eredivisie-logo.svg"
            alt="Eredivisie"
            width={52}
            height={52}
            className="h-10 w-10 sm:h-13 sm:w-13"
          />
          <span className="text-xl font-extrabold tracking-tight text-foreground sm:text-2xl">
            eredivisie<span className="text-accent">.tv</span>
          </span>
        </Link>
        <div className="hidden items-center gap-1 sm:flex">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`rounded-lg px-4 py-2.5 text-sm font-medium transition-colors ${
                pathname === item.href
                  ? 'bg-accent-light text-accent'
                  : 'text-muted hover:bg-accent-light hover:text-accent'
              }`}
            >
              {item.label}
            </Link>
          ))}
          <FavoriteClubSelector />
        </div>
      </div>
      {/* Mobile nav */}
      <nav className="flex border-t border-black/5 sm:hidden">
        {navItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={`flex-1 py-2.5 text-center text-xs font-medium transition-colors ${
              pathname === item.href ? 'text-accent' : 'text-muted hover:text-accent'
            }`}
          >
            {item.label}
          </Link>
        ))}
      </nav>
    </header>
  )
}
```

- [ ] **Step 3: Verify build**

```bash
cd /Users/nickvelten/Projects/eredivisie-tv && npm run build
```

- [ ] **Step 4: Commit**

```bash
git add src/app/layout.tsx src/components/Header.tsx
git commit -m "feat: multi-page layout with providers, active nav, favourite club selector"
```

---

## Task 7: Update MatchCard with Live Scores & Links

**Files:**
- Modify: `src/components/MatchCard.tsx`

- [ ] **Step 1: Update MatchCard to use live scores and link to match page**

Replace `src/components/MatchCard.tsx`:

```tsx
'use client'

import Image from 'next/image'
import Link from 'next/link'
import { Match } from '@/data/types'
import { formatTime } from '@/lib/utils'
import { BroadcastBadge } from './BroadcastBadge'
import { useLiveScore } from './LiveScoreProvider'

const UNIBET_URL = 'https://www.unibet.nl/betting/sports/filter/football/netherlands/eredivisie'

export function MatchCard({ match }: { match: Match }) {
  const liveData = useLiveScore(match.id)
  const status = liveData?.status ?? match.status
  const score = liveData?.score ?? match.score

  return (
    <div className="rounded-xl bg-white shadow-sm ring-1 ring-black/5 transition-shadow hover:shadow-md">
      <Link href={`/wedstrijd/${match.id}`} className="flex items-center justify-between gap-2 px-4 py-3 sm:px-5 sm:py-3.5">
        <div className="flex min-w-0 items-center gap-2 sm:gap-3">
          <Image src={match.homeTeam.logo} alt={match.homeTeam.name} width={30} height={30} className="h-5 w-5 shrink-0 sm:h-[30px] sm:w-[30px]" />
          <span className="truncate text-xs font-bold text-foreground sm:text-sm">{match.homeTeam.name}</span>
          <span className="shrink-0 text-[10px] font-medium text-muted-light sm:text-xs">vs</span>
          <span className="truncate text-xs font-bold text-foreground sm:text-sm">{match.awayTeam.name}</span>
          <Image src={match.awayTeam.logo} alt={match.awayTeam.name} width={30} height={30} className="h-5 w-5 shrink-0 sm:h-[30px] sm:w-[30px]" />
        </div>
        <div className="shrink-0">
          {status === 'finished' && score ? (
            <span className="rounded-md bg-foreground/5 px-2 py-0.5 text-xs font-bold text-foreground sm:px-2.5 sm:py-1 sm:text-sm">
              {score.home} - {score.away}
            </span>
          ) : status === 'live' ? (
            <div className="flex items-center gap-1.5 sm:gap-2">
              <span className="animate-pulse rounded-full bg-accent px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wide text-white sm:px-2 sm:text-[10px]">Live</span>
              {score && (
                <span className="text-xs font-bold text-foreground sm:text-sm">
                  {score.home} - {score.away}
                </span>
              )}
            </div>
          ) : (
            <span className="rounded-md bg-accent-light px-2 py-0.5 text-xs font-bold text-accent sm:px-2.5 sm:py-1 sm:text-sm">
              {formatTime(match.date)}
            </span>
          )}
        </div>
      </Link>

      <div className="flex items-center gap-2 border-t border-black/5 px-4 py-2 sm:px-5 sm:py-2.5">
        {match.broadcasts.length > 0 && (
          <div className="flex items-center gap-1.5 sm:gap-2">
            <span className="text-[10px] font-medium uppercase tracking-wider text-muted-light sm:text-[11px]">Kijk op:</span>
            {match.broadcasts.map((b) => (
              <BroadcastBadge key={b.name} broadcast={b} />
            ))}
          </div>
        )}

        {match.odds && status === 'scheduled' ? (
          <a
            href={UNIBET_URL}
            target="_blank"
            rel="noopener noreferrer"
            onClick={(e) => e.stopPropagation()}
            className="ml-auto inline-flex shrink-0 items-center gap-1 rounded-full bg-[#147B45] px-2 py-1 text-[9px] font-bold text-white shadow-sm transition-all hover:bg-[#00531D] hover:shadow-md sm:gap-2 sm:px-3 sm:text-[11px]"
          >
            <span className="flex items-center gap-1 border-r border-white/20 pr-1 sm:gap-1.5 sm:pr-2">
              <span className="text-[#FFE71F]">1</span>
              <span>{match.odds.home.toFixed(2)}</span>
            </span>
            <span className="flex items-center gap-1 border-r border-white/20 pr-1 sm:gap-1.5 sm:pr-2">
              <span className="text-[#FFE71F]">X</span>
              <span>{match.odds.draw.toFixed(2)}</span>
            </span>
            <span className="flex items-center gap-1 sm:gap-1.5">
              <span className="text-[#FFE71F]">2</span>
              <span>{match.odds.away.toFixed(2)}</span>
            </span>
            <span className="ml-0.5 rounded bg-[#FFE71F] px-1 py-0.5 text-[8px] font-extrabold text-[#00531D] sm:ml-1 sm:px-1.5 sm:text-[10px]">
              Unibet
            </span>
          </a>
        ) : (
          <a
            href={UNIBET_URL}
            target="_blank"
            rel="noopener noreferrer"
            onClick={(e) => e.stopPropagation()}
            className="ml-auto inline-flex shrink-0 items-center gap-1 rounded-full bg-[#147B45] px-2 py-1 text-[9px] font-bold text-white shadow-sm transition-all hover:bg-[#00531D] hover:shadow-md sm:gap-1.5 sm:px-3 sm:text-[11px]"
          >
            Zet in bij{' '}
            <span className="rounded bg-[#FFE71F] px-1 py-0.5 text-[8px] font-extrabold text-[#00531D] sm:px-1.5 sm:text-[10px]">
              Unibet
            </span>
            →
          </a>
        )}
      </div>
    </div>
  )
}
```

Note: MatchCard is now a client component because it uses `useLiveScore`. The `Link` wraps the top row so the whole match is clickable. The Unibet links use `e.stopPropagation()` so they don't trigger the Link navigation.

- [ ] **Step 2: Commit**

```bash
git add src/components/MatchCard.tsx
git commit -m "feat: MatchCard with live score updates and links to match page"
```

---

## Task 8: Homepage — Rewrite as Compact Hub

**Files:**
- Modify: `src/app/page.tsx`
- Modify: `src/components/TodayHighlight.tsx`

- [ ] **Step 1: Update TodayHighlight with countdown and live scores**

Replace `src/components/TodayHighlight.tsx`:

```tsx
import { isToday, formatDutchDate, isSameDay } from '@/lib/utils'
import { MatchCard } from './MatchCard'
import { Countdown } from './Countdown'
import { Match } from '@/data/types'

export function TodayHighlight({ matches }: { matches: Match[] }) {
  const todayMatches = matches.filter((m) => isToday(m.date))

  let displayMatches: Match[]
  let title: string
  let subtitle: string | null = null
  let countdownDate: string | null = null

  if (todayMatches.length > 0) {
    displayMatches = todayMatches
    title = 'Vandaag op TV'
    subtitle = `${todayMatches.length} wedstrijd${todayMatches.length > 1 ? 'en' : ''} vandaag`
    // Countdown to next scheduled match today
    const nextLive = todayMatches.find((m) => m.status === 'scheduled')
    if (nextLive) countdownDate = nextLive.date
  } else {
    const upcoming = matches
      .filter((m) => m.status === 'scheduled')
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    if (upcoming.length > 0) {
      const nextDay = upcoming[0].date
      displayMatches = upcoming.filter((m) => isSameDay(m.date, nextDay))
      countdownDate = upcoming[0].date
    } else {
      displayMatches = []
    }
    title = displayMatches.length > 0 ? 'Eerstvolgende wedstrijden' : 'Geen wedstrijden gepland'
    if (displayMatches.length > 0) {
      subtitle = formatDutchDate(displayMatches[0].date)
    }
  }

  if (displayMatches.length === 0) return null

  return (
    <section className="mx-auto w-full max-w-5xl px-4 py-10">
      <div className="mb-5 flex items-center gap-3 flex-wrap">
        <h2 className="text-2xl font-extrabold text-foreground">{title}</h2>
        {subtitle && (
          <span className="rounded-full bg-accent-light px-3 py-0.5 text-xs font-semibold text-accent">
            {subtitle}
          </span>
        )}
        {countdownDate && <Countdown targetDate={countdownDate} />}
      </div>
      <div className="flex flex-col gap-3">
        {displayMatches.map((match) => (
          <MatchCard key={match.id} match={match} />
        ))}
      </div>
    </section>
  )
}
```

- [ ] **Step 2: Rewrite homepage as compact hub**

Replace `src/app/page.tsx`:

```tsx
import Link from 'next/link'
import Image from 'next/image'
import { TodayHighlight } from '@/components/TodayHighlight'
import { LiveScoreProvider } from '@/components/LiveScoreProvider'
import { fetchEredivisieData } from '@/lib/espn'

export const revalidate = 3600

export default async function Home() {
  const { matchweeks, standings, allMatches, topScorers } = await fetchEredivisieData()

  const hasLive = allMatches.some((m) => m.status === 'live')

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: 'Eredivisie.tv',
    url: 'https://eredivisie.tv',
    description:
      'Bekijk alle Eredivisie wedstrijden en ontdek waar je ze live kunt zien op TV en online.',
    inLanguage: 'nl',
    publisher: {
      '@type': 'Organization',
      name: 'Eredivisie.tv',
      url: 'https://eredivisie.tv',
    },
  }

  // Upcoming matches for structured data
  const upcomingMatches = allMatches
    .filter((m) => m.status === 'scheduled')
    .slice(0, 10)
    .map((m) => ({
      '@context': 'https://schema.org',
      '@type': 'SportsEvent',
      name: `${m.homeTeam.name} vs ${m.awayTeam.name}`,
      startDate: m.date,
      homeTeam: { '@type': 'SportsTeam', name: m.homeTeam.name },
      awayTeam: { '@type': 'SportsTeam', name: m.awayTeam.name },
      location: { '@type': 'Place', name: 'Eredivisie' },
      eventStatus: 'https://schema.org/EventScheduled',
      eventAttendanceMode: 'https://schema.org/MixedEventAttendanceMode',
      offers: {
        '@type': 'Offer',
        name: 'Kijk live op ESPN',
        url: 'https://www.espn.nl',
      },
    }))

  // Top 5 standings
  const top5 = standings.slice(0, 5)

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      {upcomingMatches.map((match, i) => (
        <script
          key={i}
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(match) }}
        />
      ))}
      <main className="flex-1">
        <LiveScoreProvider hasLiveMatches={hasLive}>
          <TodayHighlight matches={allMatches} />
        </LiveScoreProvider>

        {/* Compact standings */}
        {top5.length > 0 && (
          <section className="mx-auto w-full max-w-5xl px-4 py-10">
            <div className="mb-5 flex items-center justify-between">
              <h2 className="text-2xl font-extrabold text-foreground">Stand</h2>
              <Link href="/stand" className="text-sm font-medium text-accent hover:underline">
                Volledige stand →
              </Link>
            </div>
            <div className="overflow-x-auto rounded-xl bg-white shadow-sm ring-1 ring-black/5">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b-2 border-accent/10 text-left text-[11px] font-bold uppercase tracking-wider text-muted">
                    <th className="px-4 py-3 w-8">#</th>
                    <th className="px-4 py-3">Club</th>
                    <th className="px-4 py-3 text-center">GS</th>
                    <th className="px-4 py-3 text-center">Pt</th>
                  </tr>
                </thead>
                <tbody>
                  {top5.map((entry) => (
                    <tr key={entry.club.id} className="border-b border-black/5">
                      <td className="px-4 py-2.5 font-bold text-muted">{entry.position}</td>
                      <td className="px-4 py-2.5">
                        <Link href={`/club/${entry.club.slug ?? entry.club.id}`} className="flex items-center gap-2 hover:text-accent transition-colors">
                          <Image src={entry.club.logo} alt={entry.club.name} width={20} height={20} />
                          <span className="font-semibold text-foreground">{entry.club.name}</span>
                        </Link>
                      </td>
                      <td className="px-4 py-2.5 text-center text-muted">{entry.played}</td>
                      <td className="px-4 py-2.5 text-center font-extrabold text-foreground">{entry.points}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        )}

        {/* Topscorer spotlight */}
        {topScorers.length > 0 && (
          <section className="mx-auto w-full max-w-5xl px-4 py-10">
            <div className="mb-5 flex items-center justify-between">
              <h2 className="text-2xl font-extrabold text-foreground">Topscorer</h2>
              <Link href="/topscorers" className="text-sm font-medium text-accent hover:underline">
                Alle topscorers →
              </Link>
            </div>
            <div className="rounded-xl bg-white p-5 shadow-sm ring-1 ring-black/5">
              <div className="flex items-center gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-accent-light text-lg font-extrabold text-accent">
                  1
                </div>
                <div>
                  <p className="text-lg font-bold text-foreground">{topScorers[0].name}</p>
                  <p className="text-sm text-muted">
                    {topScorers[0].goals} doelpunten in {topScorers[0].matches} wedstrijden
                  </p>
                </div>
              </div>
            </div>
          </section>
        )}

        {/* Quick links */}
        <section className="mx-auto w-full max-w-5xl px-4 py-10">
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {[
              { label: 'Programma', href: '/programma', desc: 'Alle wedstrijden per speelronde' },
              { label: 'Uitslagen', href: '/uitslagen', desc: 'Resultaten per speelronde' },
              { label: 'Topscorers', href: '/topscorers', desc: 'Doelpunten & assists' },
              { label: 'Kijken', href: '/kijken', desc: 'Waar kijk je de Eredivisie?' },
            ].map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="rounded-xl bg-white p-4 shadow-sm ring-1 ring-black/5 transition-all hover:shadow-md hover:ring-accent/20"
              >
                <p className="font-bold text-foreground">{item.label}</p>
                <p className="mt-1 text-xs text-muted">{item.desc}</p>
              </Link>
            ))}
          </div>
        </section>
      </main>
    </>
  )
}
```

- [ ] **Step 3: Verify build**

```bash
cd /Users/nickvelten/Projects/eredivisie-tv && npm run build
```

- [ ] **Step 4: Commit**

```bash
git add src/app/page.tsx src/components/TodayHighlight.tsx
git commit -m "feat: homepage as compact hub with countdown, compact stand, topscorer spotlight"
```

---

## Task 9: Programma Page

**Files:**
- Create: `src/app/programma/page.tsx`
- Modify: `src/components/MatchSchedule.tsx`

- [ ] **Step 1: Create programma page**

Create `src/app/programma/page.tsx`:

```tsx
import type { Metadata } from 'next'
import { fetchEredivisieData } from '@/lib/espn'
import { MatchSchedule } from '@/components/MatchSchedule'
import { LiveScoreProvider } from '@/components/LiveScoreProvider'
import { Breadcrumb } from '@/components/Breadcrumb'

export const revalidate = 3600

export const metadata: Metadata = {
  title: 'Programma — Eredivisie wedstrijden per speelronde',
  description: 'Bekijk het volledige Eredivisie programma per speelronde. Alle wedstrijden met tijden, TV-kanalen en live scores.',
  alternates: { canonical: 'https://eredivisie.tv/programma' },
}

export default async function ProgrammaPage() {
  const { matchweeks, allMatches } = await fetchEredivisieData()
  const hasLive = allMatches.some((m) => m.status === 'live')

  return (
    <main className="flex-1">
      <div className="mx-auto w-full max-w-5xl px-4 pt-8">
        <Breadcrumb items={[{ label: 'Programma' }]} />
      </div>
      <LiveScoreProvider hasLiveMatches={hasLive}>
        <MatchSchedule matchweeks={matchweeks} />
      </LiveScoreProvider>
    </main>
  )
}
```

- [ ] **Step 2: Update MatchSchedule to support club filter**

Replace `src/components/MatchSchedule.tsx`:

```tsx
'use client'

import { useState } from 'react'
import { Matchweek } from '@/data/types'
import { formatDutchDate, groupMatchesByDate } from '@/lib/utils'
import { MatchCard } from './MatchCard'
import { ClubFilter, filterByClub } from './ClubFilter'
import { useFavoriteClub } from './FavoriteClubProvider'

export function MatchSchedule({ matchweeks }: { matchweeks: Matchweek[] }) {
  const [weekIndex, setWeekIndex] = useState(() => {
    const idx = matchweeks.findIndex((mw) =>
      mw.matches.some((m) => m.status === 'scheduled' || m.status === 'live')
    )
    return idx >= 0 ? idx : matchweeks.length - 1
  })
  const [clubFilterEnabled, setClubFilterEnabled] = useState(false)
  const { favoriteSlug } = useFavoriteClub()

  if (matchweeks.length === 0) {
    return (
      <section className="mx-auto w-full max-w-5xl px-4 py-10">
        <h2 className="mb-4 text-2xl font-extrabold text-foreground">Programma</h2>
        <p className="text-sm text-muted">Geen wedstrijden beschikbaar.</p>
      </section>
    )
  }

  const week = matchweeks[weekIndex]
  const filteredMatches = filterByClub(week.matches, favoriteSlug, clubFilterEnabled)
  const grouped = groupMatchesByDate(filteredMatches)

  return (
    <section className="mx-auto w-full max-w-5xl px-4 py-10">
      <div className="mb-8 flex items-center justify-between">
        <button
          onClick={() => setWeekIndex((i) => Math.max(0, i - 1))}
          disabled={weekIndex === 0}
          className="rounded-lg bg-white px-4 py-2 text-sm font-medium text-muted shadow-sm ring-1 ring-black/5 transition-all hover:shadow-md hover:text-foreground disabled:opacity-30 disabled:hover:shadow-sm"
        >
          ← Vorige
        </button>
        <div className="text-center">
          <h2 className="text-2xl font-extrabold text-foreground">Speelronde {week.number}</h2>
          <p className="text-xs text-muted-light">van {matchweeks[matchweeks.length - 1].number} speelrondes</p>
        </div>
        <button
          onClick={() => setWeekIndex((i) => Math.min(matchweeks.length - 1, i + 1))}
          disabled={weekIndex === matchweeks.length - 1}
          className="rounded-lg bg-white px-4 py-2 text-sm font-medium text-muted shadow-sm ring-1 ring-black/5 transition-all hover:shadow-md hover:text-foreground disabled:opacity-30 disabled:hover:shadow-sm"
        >
          Volgende →
        </button>
      </div>

      <div className="mb-6">
        <ClubFilter enabled={clubFilterEnabled} onToggle={setClubFilterEnabled} />
      </div>

      <div className="flex flex-col gap-8">
        {Array.from(grouped.entries()).map(([dateKey, matches]) => (
          <div key={dateKey}>
            <div className="mb-3 flex items-center gap-3">
              <div className="h-px flex-1 bg-accent/20" />
              <h3 className="text-xs font-bold uppercase tracking-widest text-accent">
                {formatDutchDate(matches[0].date)}
              </h3>
              <div className="h-px flex-1 bg-accent/20" />
            </div>
            <div className="flex flex-col gap-2.5">
              {matches.map((match) => (
                <MatchCard key={match.id} match={match} />
              ))}
            </div>
          </div>
        ))}
        {filteredMatches.length === 0 && (
          <p className="text-sm text-muted text-center py-8">Geen wedstrijden gevonden voor jouw club in deze speelronde.</p>
        )}
      </div>
    </section>
  )
}
```

- [ ] **Step 3: Verify build**

```bash
cd /Users/nickvelten/Projects/eredivisie-tv && npm run build
```

- [ ] **Step 4: Commit**

```bash
git add src/app/programma/page.tsx src/components/MatchSchedule.tsx
git commit -m "feat: add /programma page with club filter"
```

---

## Task 10: Uitslagen Page

**Files:**
- Create: `src/app/uitslagen/page.tsx`
- Modify: `src/components/Results.tsx`

- [ ] **Step 1: Create uitslagen page**

Create `src/app/uitslagen/page.tsx`:

```tsx
import type { Metadata } from 'next'
import { fetchEredivisieData } from '@/lib/espn'
import { Results } from '@/components/Results'
import { Breadcrumb } from '@/components/Breadcrumb'

export const revalidate = 3600

export const metadata: Metadata = {
  title: 'Uitslagen — Eredivisie resultaten per speelronde',
  description: 'Alle Eredivisie uitslagen per speelronde. Bekijk de resultaten van alle wedstrijden.',
  alternates: { canonical: 'https://eredivisie.tv/uitslagen' },
}

export default async function UitslagenPage() {
  const { matchweeks } = await fetchEredivisieData()

  return (
    <main className="flex-1">
      <div className="mx-auto w-full max-w-5xl px-4 pt-8">
        <Breadcrumb items={[{ label: 'Uitslagen' }]} />
      </div>
      <Results matchweeks={matchweeks} />
    </main>
  )
}
```

- [ ] **Step 2: Update Results to support club filter and link to match pages**

Replace `src/components/Results.tsx`:

```tsx
'use client'

import { useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { Matchweek } from '@/data/types'
import { formatDutchDate, groupMatchesByDate } from '@/lib/utils'
import { ClubFilter, filterByClub } from './ClubFilter'
import { useFavoriteClub } from './FavoriteClubProvider'

export function Results({ matchweeks }: { matchweeks: Matchweek[] }) {
  const finishedWeeks = matchweeks
    .map((mw) => ({
      ...mw,
      matches: mw.matches.filter((m) => m.status === 'finished'),
    }))
    .filter((mw) => mw.matches.length > 0)

  const [weekIndex, setWeekIndex] = useState(() => Math.max(0, finishedWeeks.length - 1))
  const [clubFilterEnabled, setClubFilterEnabled] = useState(false)
  const { favoriteSlug } = useFavoriteClub()

  if (finishedWeeks.length === 0) return null

  const week = finishedWeeks[weekIndex]
  const filteredMatches = filterByClub(week.matches, favoriteSlug, clubFilterEnabled)
  const grouped = groupMatchesByDate(filteredMatches)

  return (
    <section className="mx-auto w-full max-w-5xl px-4 py-10">
      <div className="mb-8 flex items-center justify-between">
        <button
          onClick={() => setWeekIndex((i) => Math.max(0, i - 1))}
          disabled={weekIndex === 0}
          className="rounded-lg bg-white px-4 py-2 text-sm font-medium text-muted shadow-sm ring-1 ring-black/5 transition-all hover:shadow-md hover:text-foreground disabled:opacity-30 disabled:hover:shadow-sm"
        >
          ← Vorige
        </button>
        <div className="text-center">
          <h2 className="text-2xl font-extrabold text-foreground">Uitslagen</h2>
          <p className="text-xs text-muted-light">Speelronde {week.number}</p>
        </div>
        <button
          onClick={() => setWeekIndex((i) => Math.min(finishedWeeks.length - 1, i + 1))}
          disabled={weekIndex === finishedWeeks.length - 1}
          className="rounded-lg bg-white px-4 py-2 text-sm font-medium text-muted shadow-sm ring-1 ring-black/5 transition-all hover:shadow-md hover:text-foreground disabled:opacity-30 disabled:hover:shadow-sm"
        >
          Volgende →
        </button>
      </div>

      <div className="mb-6">
        <ClubFilter enabled={clubFilterEnabled} onToggle={setClubFilterEnabled} />
      </div>

      <div className="flex flex-col gap-6">
        {Array.from(grouped.entries()).map(([dateKey, matches]) => (
          <div key={dateKey}>
            <div className="mb-3 flex items-center gap-3">
              <div className="h-px flex-1 bg-accent/20" />
              <h3 className="text-xs font-bold uppercase tracking-widest text-accent">
                {formatDutchDate(matches[0].date)}
              </h3>
              <div className="h-px flex-1 bg-accent/20" />
            </div>
            <div className="flex flex-col gap-2">
              {matches.map((match) => (
                <Link
                  key={match.id}
                  href={`/wedstrijd/${match.id}`}
                  className="flex items-center rounded-xl bg-white px-4 py-3 shadow-sm ring-1 ring-black/5 transition-all hover:shadow-md sm:px-5"
                >
                  <div className="flex flex-1 items-center justify-end gap-2 sm:gap-3">
                    <span className="truncate text-xs font-bold text-foreground sm:text-sm">
                      {match.homeTeam.name}
                    </span>
                    <Image
                      src={match.homeTeam.logo}
                      alt={match.homeTeam.name}
                      width={24}
                      height={24}
                      className="h-5 w-5 shrink-0 sm:h-6 sm:w-6"
                    />
                  </div>
                  <div className="mx-3 shrink-0 sm:mx-5">
                    {match.score ? (
                      <span className="rounded-lg bg-foreground/5 px-3 py-1 text-sm font-extrabold text-foreground sm:px-4 sm:text-base">
                        {match.score.home} - {match.score.away}
                      </span>
                    ) : (
                      <span className="text-xs text-muted">-</span>
                    )}
                  </div>
                  <div className="flex flex-1 items-center gap-2 sm:gap-3">
                    <Image
                      src={match.awayTeam.logo}
                      alt={match.awayTeam.name}
                      width={24}
                      height={24}
                      className="h-5 w-5 shrink-0 sm:h-6 sm:w-6"
                    />
                    <span className="truncate text-xs font-bold text-foreground sm:text-sm">
                      {match.awayTeam.name}
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        ))}
        {filteredMatches.length === 0 && (
          <p className="text-sm text-muted text-center py-8">Geen uitslagen gevonden voor jouw club in deze speelronde.</p>
        )}
      </div>
    </section>
  )
}
```

- [ ] **Step 3: Verify build**

```bash
cd /Users/nickvelten/Projects/eredivisie-tv && npm run build
```

- [ ] **Step 4: Commit**

```bash
git add src/app/uitslagen/page.tsx src/components/Results.tsx
git commit -m "feat: add /uitslagen page with club filter and match links"
```

---

## Task 11: Stand Page

**Files:**
- Create: `src/app/stand/page.tsx`
- Modify: `src/components/Standings.tsx`

- [ ] **Step 1: Create stand page**

Create `src/app/stand/page.tsx`:

```tsx
import type { Metadata } from 'next'
import { fetchStandings } from '@/lib/espn-fetchers'
import { Standings } from '@/components/Standings'
import { Breadcrumb } from '@/components/Breadcrumb'

export const revalidate = 3600

export const metadata: Metadata = {
  title: 'Eredivisie Stand 2025/26 — Actuele ranglijst',
  description: 'De actuele Eredivisie stand met alle 18 clubs. Punten, doelsaldo, gewonnen, gelijk en verloren wedstrijden.',
  alternates: { canonical: 'https://eredivisie.tv/stand' },
}

export default async function StandPage() {
  const standings = await fetchStandings()

  return (
    <main className="flex-1">
      <div className="mx-auto w-full max-w-5xl px-4 pt-8">
        <Breadcrumb items={[{ label: 'Stand' }]} />
      </div>
      <Standings standings={standings} />
    </main>
  )
}
```

- [ ] **Step 2: Update Standings to highlight favourite club and link to club pages**

Replace `src/components/Standings.tsx`:

```tsx
'use client'

import Image from 'next/image'
import Link from 'next/link'
import { StandingEntry } from '@/data/types'
import { useFavoriteClub } from './FavoriteClubProvider'
import { slugToEspnId } from '@/data/club-mapping'

function positionStyle(pos: number): string {
  if (pos === 1) return 'border-l-3 border-yellow-400 bg-yellow-50/50'
  if (pos <= 3) return 'border-l-3 border-blue-400'
  if (pos === 4) return 'border-l-3 border-emerald-400'
  if (pos >= 16 && pos <= 17) return 'border-l-3 border-orange-400 bg-orange-50/30'
  if (pos === 18) return 'border-l-3 border-red-400 bg-red-50/30'
  return 'border-l-3 border-transparent'
}

export function Standings({ standings }: { standings: StandingEntry[] }) {
  const { favoriteSlug } = useFavoriteClub()
  const favoriteEspnId = favoriteSlug ? slugToEspnId[favoriteSlug] : null

  if (standings.length === 0) {
    return (
      <section className="mx-auto w-full max-w-5xl px-4 py-10">
        <h2 className="mb-4 text-2xl font-extrabold text-foreground">Eredivisie Stand</h2>
        <p className="text-sm text-muted">Stand niet beschikbaar.</p>
      </section>
    )
  }

  return (
    <section className="mx-auto w-full max-w-5xl px-4 py-10">
      <h2 className="mb-6 text-2xl font-extrabold text-foreground">Eredivisie Stand</h2>
      <div className="overflow-x-auto rounded-xl bg-white shadow-sm ring-1 ring-black/5">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b-2 border-accent/10 text-left text-[11px] font-bold uppercase tracking-wider text-muted">
              <th className="px-4 py-3.5 w-8">#</th>
              <th className="px-4 py-3.5">Club</th>
              <th className="px-4 py-3.5 text-center">GS</th>
              <th className="px-4 py-3.5 text-center">W</th>
              <th className="px-4 py-3.5 text-center">G</th>
              <th className="px-4 py-3.5 text-center">V</th>
              <th className="px-4 py-3.5 text-center hidden sm:table-cell">DV</th>
              <th className="px-4 py-3.5 text-center hidden sm:table-cell">DT</th>
              <th className="px-4 py-3.5 text-center hidden sm:table-cell">+/-</th>
              <th className="px-4 py-3.5 text-center">Pt</th>
            </tr>
          </thead>
          <tbody>
            {standings.map((entry) => {
              const isFavorite = favoriteEspnId === entry.club.id
              return (
                <tr
                  key={entry.club.id}
                  className={`border-b border-black/5 transition-colors hover:bg-background ${positionStyle(entry.position)} ${
                    isFavorite ? 'bg-accent-light/40' : ''
                  }`}
                >
                  <td className="px-4 py-3 font-bold text-muted">{entry.position}</td>
                  <td className="px-4 py-3">
                    <Link href={`/club/${entry.club.slug ?? entry.club.id}`} className="flex items-center gap-2.5 hover:text-accent transition-colors">
                      <Image src={entry.club.logo} alt={entry.club.name} width={22} height={22} />
                      <span className={`font-semibold ${isFavorite ? 'text-accent' : 'text-foreground'}`}>{entry.club.name}</span>
                    </Link>
                  </td>
                  <td className="px-4 py-3 text-center text-muted">{entry.played}</td>
                  <td className="px-4 py-3 text-center text-muted">{entry.won}</td>
                  <td className="px-4 py-3 text-center text-muted">{entry.drawn}</td>
                  <td className="px-4 py-3 text-center text-muted">{entry.lost}</td>
                  <td className="px-4 py-3 text-center text-muted hidden sm:table-cell">{entry.goalsFor}</td>
                  <td className="px-4 py-3 text-center text-muted hidden sm:table-cell">{entry.goalsAgainst}</td>
                  <td className="px-4 py-3 text-center text-muted hidden sm:table-cell">
                    {entry.goalsFor - entry.goalsAgainst > 0 ? '+' : ''}
                    {entry.goalsFor - entry.goalsAgainst}
                  </td>
                  <td className="px-4 py-3 text-center text-base font-extrabold text-foreground">{entry.points}</td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
      <div className="mt-4 flex flex-wrap gap-5 text-xs font-medium text-muted">
        <span className="flex items-center gap-1.5">
          <span className="h-2.5 w-2.5 rounded-full bg-yellow-400" /> Champions League
        </span>
        <span className="flex items-center gap-1.5">
          <span className="h-2.5 w-2.5 rounded-full bg-blue-400" /> Europa League
        </span>
        <span className="flex items-center gap-1.5">
          <span className="h-2.5 w-2.5 rounded-full bg-emerald-400" /> Conference League
        </span>
        <span className="flex items-center gap-1.5">
          <span className="h-2.5 w-2.5 rounded-full bg-orange-400" /> Nacompetitie
        </span>
        <span className="flex items-center gap-1.5">
          <span className="h-2.5 w-2.5 rounded-full bg-red-400" /> Degradatie
        </span>
      </div>
    </section>
  )
}
```

- [ ] **Step 3: Verify build**

```bash
cd /Users/nickvelten/Projects/eredivisie-tv && npm run build
```

- [ ] **Step 4: Commit**

```bash
git add src/app/stand/page.tsx src/components/Standings.tsx
git commit -m "feat: add /stand page with favourite club highlight and club links"
```

---

## Task 12: Topscorers Page

**Files:**
- Create: `src/app/topscorers/page.tsx`

- [ ] **Step 1: Create topscorers page**

Create `src/app/topscorers/page.tsx`:

```tsx
import type { Metadata } from 'next'
import { fetchLeaders } from '@/lib/espn-fetchers'
import { TopScorers } from '@/components/TopScorers'
import { Breadcrumb } from '@/components/Breadcrumb'

export const revalidate = 3600

export const metadata: Metadata = {
  title: 'Topscorers — Eredivisie doelpuntenmakers & assists',
  description: 'De topscorers en assistgevers van de Eredivisie. Bekijk wie de meeste doelpunten en assists heeft.',
  alternates: { canonical: 'https://eredivisie.tv/topscorers' },
}

export default async function TopscorersPage() {
  const { topScorers, topAssisters } = await fetchLeaders()

  return (
    <main className="flex-1">
      <div className="mx-auto w-full max-w-5xl px-4 pt-8">
        <Breadcrumb items={[{ label: 'Topscorers' }]} />
      </div>
      <TopScorers topScorers={topScorers} topAssisters={topAssisters} />
    </main>
  )
}
```

The existing `TopScorers` component already works well — no changes needed.

- [ ] **Step 2: Verify build**

```bash
cd /Users/nickvelten/Projects/eredivisie-tv && npm run build
```

- [ ] **Step 3: Commit**

```bash
git add src/app/topscorers/page.tsx
git commit -m "feat: add /topscorers page"
```

---

## Task 13: Club Page

**Files:**
- Create: `src/app/club/[slug]/page.tsx`

- [ ] **Step 1: Create club page**

Create `src/app/club/[slug]/page.tsx`:

```tsx
import type { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { slugToEspnId, slugToDisplayName, espnIdToSlug } from '@/data/club-mapping'
import { fetchClubMatches, fetchStandings } from '@/lib/espn-fetchers'
import { formatDutchDate, formatTime } from '@/lib/utils'
import { Breadcrumb } from '@/components/Breadcrumb'

export const revalidate = 3600

export async function generateStaticParams() {
  return Object.values(espnIdToSlug).map((slug) => ({ slug }))
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params
  const name = slugToDisplayName[slug]
  if (!name) return {}
  return {
    title: `${name} — Eredivisie programma, uitslagen & stand`,
    description: `Bekijk het programma, de uitslagen en de stand van ${name} in de Eredivisie.`,
    alternates: { canonical: `https://eredivisie.tv/club/${slug}` },
  }
}

export default async function ClubPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const espnId = slugToEspnId[slug]
  if (!espnId) notFound()

  const [{ upcoming, recent }, standings] = await Promise.all([
    fetchClubMatches(espnId),
    fetchStandings(),
  ])

  const clubName = slugToDisplayName[slug] ?? slug
  const standing = standings.find((s) => s.club.id === espnId)

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'SportsTeam',
    name: clubName,
    sport: 'Football',
    memberOf: {
      '@type': 'SportsOrganization',
      name: 'Eredivisie',
    },
  }

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <main className="flex-1">
        <div className="mx-auto w-full max-w-5xl px-4 pt-8">
          <Breadcrumb items={[{ label: 'Clubs', href: '/stand' }, { label: clubName }]} />
        </div>

        {/* Club header */}
        <section className="mx-auto w-full max-w-5xl px-4 py-8">
          <div className="flex items-center gap-5">
            {standing && (
              <Image src={standing.club.logo} alt={clubName} width={64} height={64} className="h-16 w-16" />
            )}
            <div>
              <h1 className="text-3xl font-extrabold text-foreground">{clubName}</h1>
              {standing && (
                <p className="mt-1 text-sm text-muted">
                  {standing.position}e plaats — {standing.points} punten — {standing.played} wedstrijden
                </p>
              )}
            </div>
          </div>

          {/* Season stats */}
          {standing && (
            <div className="mt-6 grid grid-cols-3 gap-3 sm:grid-cols-6">
              {[
                { label: 'Gewonnen', value: standing.won },
                { label: 'Gelijk', value: standing.drawn },
                { label: 'Verloren', value: standing.lost },
                { label: 'Goals voor', value: standing.goalsFor },
                { label: 'Goals tegen', value: standing.goalsAgainst },
                { label: 'Doelsaldo', value: `${standing.goalsFor - standing.goalsAgainst > 0 ? '+' : ''}${standing.goalsFor - standing.goalsAgainst}` },
              ].map((stat) => (
                <div key={stat.label} className="rounded-xl bg-white p-3 text-center shadow-sm ring-1 ring-black/5">
                  <p className="text-lg font-extrabold text-foreground">{stat.value}</p>
                  <p className="text-[11px] font-medium text-muted">{stat.label}</p>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Upcoming matches */}
        {upcoming.length > 0 && (
          <section className="mx-auto w-full max-w-5xl px-4 py-8">
            <h2 className="mb-4 text-xl font-extrabold text-foreground">Aankomende wedstrijden</h2>
            <div className="flex flex-col gap-2">
              {upcoming.map((match) => (
                <Link
                  key={match.id}
                  href={`/wedstrijd/${match.id}`}
                  className="flex items-center justify-between rounded-xl bg-white px-4 py-3 shadow-sm ring-1 ring-black/5 transition-all hover:shadow-md sm:px-5"
                >
                  <div className="flex items-center gap-2 sm:gap-3">
                    <Image src={match.homeTeam.logo} alt={match.homeTeam.name} width={24} height={24} className="h-5 w-5" />
                    <span className="text-xs font-bold text-foreground sm:text-sm">{match.homeTeam.shortName}</span>
                    <span className="text-[10px] text-muted-light">vs</span>
                    <span className="text-xs font-bold text-foreground sm:text-sm">{match.awayTeam.shortName}</span>
                    <Image src={match.awayTeam.logo} alt={match.awayTeam.name} width={24} height={24} className="h-5 w-5" />
                  </div>
                  <div className="text-right">
                    <p className="text-xs font-bold text-accent">{formatTime(match.date)}</p>
                    <p className="text-[10px] text-muted-light">{formatDutchDate(match.date)}</p>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        )}

        {/* Recent results */}
        {recent.length > 0 && (
          <section className="mx-auto w-full max-w-5xl px-4 py-8">
            <h2 className="mb-4 text-xl font-extrabold text-foreground">Recente resultaten</h2>
            <div className="flex flex-col gap-2">
              {recent.map((match) => (
                <Link
                  key={match.id}
                  href={`/wedstrijd/${match.id}`}
                  className="flex items-center justify-between rounded-xl bg-white px-4 py-3 shadow-sm ring-1 ring-black/5 transition-all hover:shadow-md sm:px-5"
                >
                  <div className="flex items-center gap-2 sm:gap-3">
                    <Image src={match.homeTeam.logo} alt={match.homeTeam.name} width={24} height={24} className="h-5 w-5" />
                    <span className="text-xs font-bold text-foreground sm:text-sm">{match.homeTeam.shortName}</span>
                    <span className="text-[10px] text-muted-light">vs</span>
                    <span className="text-xs font-bold text-foreground sm:text-sm">{match.awayTeam.shortName}</span>
                    <Image src={match.awayTeam.logo} alt={match.awayTeam.name} width={24} height={24} className="h-5 w-5" />
                  </div>
                  {match.score && (
                    <span className="rounded-md bg-foreground/5 px-2.5 py-1 text-sm font-bold text-foreground">
                      {match.score.home} - {match.score.away}
                    </span>
                  )}
                </Link>
              ))}
            </div>
          </section>
        )}
      </main>
    </>
  )
}
```

- [ ] **Step 2: Verify build**

```bash
cd /Users/nickvelten/Projects/eredivisie-tv && npm run build
```

- [ ] **Step 3: Commit**

```bash
git add src/app/club/
git commit -m "feat: add /club/[slug] page with schedule, results, and stats"
```

---

## Task 14: Match Detail Page

**Files:**
- Create: `src/app/wedstrijd/[id]/page.tsx`

- [ ] **Step 1: Create match detail page**

Create `src/app/wedstrijd/[id]/page.tsx`:

```tsx
import type { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { fetchMatchById } from '@/lib/espn-fetchers'
import { formatDutchDate, formatTime } from '@/lib/utils'
import { Breadcrumb } from '@/components/Breadcrumb'
import { BroadcastBadge } from '@/components/BroadcastBadge'

export const revalidate = 300

const UNIBET_URL = 'https://www.unibet.nl/betting/sports/filter/football/netherlands/eredivisie'

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params
  const match = await fetchMatchById(id)
  if (!match) return {}
  return {
    title: `${match.homeTeam.name} - ${match.awayTeam.name}`,
    description: `${match.homeTeam.name} vs ${match.awayTeam.name} — Eredivisie wedstrijd. Bekijk uitzendinfo, odds en live score.`,
    alternates: { canonical: `https://eredivisie.tv/wedstrijd/${id}` },
  }
}

export default async function WedstrijdPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const match = await fetchMatchById(id)
  if (!match) notFound()

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'SportsEvent',
    name: `${match.homeTeam.name} vs ${match.awayTeam.name}`,
    startDate: match.date,
    homeTeam: { '@type': 'SportsTeam', name: match.homeTeam.name },
    awayTeam: { '@type': 'SportsTeam', name: match.awayTeam.name },
    location: { '@type': 'Place', name: 'Eredivisie' },
    eventStatus: match.status === 'finished'
      ? 'https://schema.org/EventCompleted'
      : 'https://schema.org/EventScheduled',
    eventAttendanceMode: 'https://schema.org/MixedEventAttendanceMode',
  }

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <main className="flex-1">
        <div className="mx-auto w-full max-w-5xl px-4 pt-8">
          <Breadcrumb
            items={[
              { label: 'Programma', href: '/programma' },
              { label: `${match.homeTeam.shortName} - ${match.awayTeam.shortName}` },
            ]}
          />
        </div>

        <section className="mx-auto w-full max-w-5xl px-4 py-8">
          {/* Match header */}
          <div className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-black/5 sm:p-8">
            <div className="flex items-center justify-center gap-6 sm:gap-10">
              {/* Home team */}
              <div className="flex flex-col items-center gap-2">
                <Link href={`/club/${match.homeTeam.slug ?? match.homeTeam.id}`}>
                  <Image src={match.homeTeam.logo} alt={match.homeTeam.name} width={64} height={64} className="h-14 w-14 sm:h-16 sm:w-16" />
                </Link>
                <Link href={`/club/${match.homeTeam.slug ?? match.homeTeam.id}`} className="text-center text-sm font-bold text-foreground hover:text-accent transition-colors sm:text-base">
                  {match.homeTeam.name}
                </Link>
              </div>

              {/* Score / Time */}
              <div className="text-center">
                {match.status === 'finished' && match.score ? (
                  <div className="rounded-xl bg-foreground/5 px-5 py-3">
                    <p className="text-3xl font-extrabold text-foreground sm:text-4xl">
                      {match.score.home} - {match.score.away}
                    </p>
                    <p className="mt-1 text-xs font-medium text-muted">Eindstand</p>
                  </div>
                ) : match.status === 'live' && match.score ? (
                  <div className="rounded-xl bg-accent/5 px-5 py-3">
                    <p className="text-3xl font-extrabold text-foreground sm:text-4xl">
                      {match.score.home} - {match.score.away}
                    </p>
                    <span className="mt-1 inline-flex items-center gap-1.5 text-xs font-bold text-accent">
                      <span className="h-2 w-2 animate-pulse rounded-full bg-accent" />
                      Live
                    </span>
                  </div>
                ) : (
                  <div>
                    <p className="text-3xl font-extrabold text-accent sm:text-4xl">{formatTime(match.date)}</p>
                    <p className="mt-1 text-xs font-medium text-muted">{formatDutchDate(match.date)}</p>
                  </div>
                )}
              </div>

              {/* Away team */}
              <div className="flex flex-col items-center gap-2">
                <Link href={`/club/${match.awayTeam.slug ?? match.awayTeam.id}`}>
                  <Image src={match.awayTeam.logo} alt={match.awayTeam.name} width={64} height={64} className="h-14 w-14 sm:h-16 sm:w-16" />
                </Link>
                <Link href={`/club/${match.awayTeam.slug ?? match.awayTeam.id}`} className="text-center text-sm font-bold text-foreground hover:text-accent transition-colors sm:text-base">
                  {match.awayTeam.name}
                </Link>
              </div>
            </div>

            {/* Broadcast info */}
            <div className="mt-6 flex items-center justify-center gap-2 border-t border-black/5 pt-5">
              <span className="text-xs font-medium uppercase tracking-wider text-muted-light">Kijk op:</span>
              {match.broadcasts.map((b) => (
                <BroadcastBadge key={b.name} broadcast={b} />
              ))}
            </div>

            {/* Unibet odds */}
            {match.odds && match.status === 'scheduled' && (
              <div className="mt-5 flex justify-center">
                <a
                  href={UNIBET_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 rounded-full bg-[#147B45] px-4 py-2 text-sm font-bold text-white shadow-sm transition-all hover:bg-[#00531D] hover:shadow-md"
                >
                  <span className="flex items-center gap-1.5 border-r border-white/20 pr-2">
                    <span className="text-[#FFE71F]">1</span>
                    <span>{match.odds.home.toFixed(2)}</span>
                  </span>
                  <span className="flex items-center gap-1.5 border-r border-white/20 pr-2">
                    <span className="text-[#FFE71F]">X</span>
                    <span>{match.odds.draw.toFixed(2)}</span>
                  </span>
                  <span className="flex items-center gap-1.5">
                    <span className="text-[#FFE71F]">2</span>
                    <span>{match.odds.away.toFixed(2)}</span>
                  </span>
                  <span className="ml-1 rounded bg-[#FFE71F] px-2 py-0.5 text-xs font-extrabold text-[#00531D]">
                    Unibet
                  </span>
                </a>
              </div>
            )}
          </div>
        </section>
      </main>
    </>
  )
}
```

- [ ] **Step 2: Verify build**

```bash
cd /Users/nickvelten/Projects/eredivisie-tv && npm run build
```

- [ ] **Step 3: Commit**

```bash
git add src/app/wedstrijd/
git commit -m "feat: add /wedstrijd/[id] match detail page with odds and broadcast info"
```

---

## Task 15: Kijken Page — Providers, Comparison Table & FAQ

**Files:**
- Create: `src/app/kijken/page.tsx`
- Create: `src/components/ComparisonTable.tsx`
- Create: `src/components/FAQ.tsx`

- [ ] **Step 1: Create ComparisonTable**

Create `src/components/ComparisonTable.tsx`:

```tsx
import { providers } from '@/data/providers'

export function ComparisonTable() {
  return (
    <div className="overflow-x-auto rounded-xl bg-white shadow-sm ring-1 ring-black/5">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b-2 border-accent/10 text-left text-[11px] font-bold uppercase tracking-wider text-muted">
            <th className="px-4 py-3.5">Provider</th>
            <th className="px-4 py-3.5 text-center">Prijs</th>
            <th className="px-4 py-3.5 text-center">Kanalen</th>
            <th className="px-4 py-3.5 text-center hidden sm:table-cell">Type</th>
          </tr>
        </thead>
        <tbody>
          {providers.map((p) => (
            <tr key={p.name} className="border-b border-black/5 transition-colors hover:bg-background">
              <td className="px-4 py-3">
                <a href={p.url} target="_blank" rel="noopener noreferrer" className="font-semibold text-foreground hover:text-accent transition-colors">
                  {p.name}
                </a>
              </td>
              <td className="px-4 py-3 text-center font-bold text-accent">{p.price}</td>
              <td className="px-4 py-3 text-center text-muted">{p.channels.length}</td>
              <td className="px-4 py-3 text-center text-muted hidden sm:table-cell">
                {p.name.includes('ESPN.nl') || p.name.includes('GO') ? 'Streaming' : 'Kabel/IPTV'}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
```

- [ ] **Step 2: Create FAQ**

Create `src/components/FAQ.tsx`:

```tsx
const faqs = [
  {
    question: 'Waar kan ik de Eredivisie kijken?',
    answer:
      'De Eredivisie wordt uitgezonden door ESPN. Je kunt ESPN ontvangen via providers als Ziggo, KPN, Odido en Canal Digitaal. Ook kun je rechtstreeks streamen via ESPN.nl.',
  },
  {
    question: 'Hoeveel kost ESPN?',
    answer:
      'De prijs van ESPN varieert per provider. Bij Ziggo Sport kost het €14,95 per maand, bij KPN €15,95 per maand. Direct streamen via ESPN.nl kost €16,99 per maand.',
  },
  {
    question: 'Kan ik de Eredivisie gratis kijken?',
    answer:
      'Nee, ESPN is een betaalzender. Wel bieden sommige providers proefperiodes aan. Ziggo GO is gratis voor Ziggo klanten met het Sport pakket.',
  },
  {
    question: 'Welke provider heeft alle ESPN-kanalen?',
    answer:
      'ESPN.nl (de streamingdienst) heeft alle kanalen inclusief ESPN Extra. Bij kabelproviders heeft Ziggo de meeste kanalen met ESPN 1 t/m 4.',
  },
]

export function FAQ() {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map((faq) => ({
      '@type': 'Question',
      name: faq.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: faq.answer,
      },
    })),
  }

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <div className="flex flex-col gap-3">
        {faqs.map((faq) => (
          <details key={faq.question} className="group rounded-xl bg-white shadow-sm ring-1 ring-black/5">
            <summary className="cursor-pointer px-5 py-4 text-sm font-bold text-foreground transition-colors hover:text-accent">
              {faq.question}
            </summary>
            <p className="px-5 pb-4 text-sm text-muted leading-relaxed">{faq.answer}</p>
          </details>
        ))}
      </div>
    </>
  )
}
```

- [ ] **Step 3: Create kijken page**

Create `src/app/kijken/page.tsx`:

```tsx
import type { Metadata } from 'next'
import { Providers } from '@/components/Providers'
import { ComparisonTable } from '@/components/ComparisonTable'
import { FAQ } from '@/components/FAQ'
import { Breadcrumb } from '@/components/Breadcrumb'

export const metadata: Metadata = {
  title: 'Waar kijk je de Eredivisie? — Providers & prijzen',
  description:
    'Vergelijk alle TV-providers voor de Eredivisie. ESPN prijzen, kanalen en streaming opties bij Ziggo, KPN, Odido, Canal Digitaal en ESPN.nl.',
  alternates: { canonical: 'https://eredivisie.tv/kijken' },
}

export default function KijkenPage() {
  return (
    <main className="flex-1">
      <div className="mx-auto w-full max-w-5xl px-4 pt-8">
        <Breadcrumb items={[{ label: 'Kijken' }]} />
      </div>

      <Providers />

      <section className="mx-auto w-full max-w-5xl px-4 py-10">
        <h2 className="mb-6 text-2xl font-extrabold text-foreground">Vergelijk providers</h2>
        <ComparisonTable />
      </section>

      <section className="mx-auto w-full max-w-5xl px-4 py-10">
        <h2 className="mb-6 text-2xl font-extrabold text-foreground">Veelgestelde vragen</h2>
        <FAQ />
      </section>
    </main>
  )
}
```

- [ ] **Step 4: Verify build**

```bash
cd /Users/nickvelten/Projects/eredivisie-tv && npm run build
```

- [ ] **Step 5: Commit**

```bash
git add src/app/kijken/ src/components/ComparisonTable.tsx src/components/FAQ.tsx
git commit -m "feat: add /kijken page with provider comparison table and FAQ"
```

---

## Task 16: Dynamic OG Images

**Files:**
- Create: `src/app/opengraph-image.tsx`
- Create: `src/app/stand/opengraph-image.tsx`
- Create: `src/app/club/[slug]/opengraph-image.tsx`
- Create: `src/app/wedstrijd/[id]/opengraph-image.tsx`

- [ ] **Step 1: Create homepage OG image**

Create `src/app/opengraph-image.tsx`:

```tsx
import { ImageResponse } from 'next/og'

export const runtime = 'nodejs'
export const alt = 'Eredivisie.tv — Alle wedstrijden op TV'
export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'

export default function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          width: '100%',
          height: '100%',
          backgroundColor: '#f8f9fa',
          fontFamily: 'sans-serif',
        }}
      >
        <div style={{ fontSize: 72, fontWeight: 800, color: '#1a1a2e' }}>
          eredivisie<span style={{ color: '#e01e36' }}>.tv</span>
        </div>
        <div style={{ fontSize: 28, color: '#64748b', marginTop: 16 }}>
          Alle Eredivisie wedstrijden op TV & online
        </div>
      </div>
    ),
    { ...size }
  )
}
```

- [ ] **Step 2: Create standings OG image**

Create `src/app/stand/opengraph-image.tsx`:

```tsx
import { ImageResponse } from 'next/og'
import { fetchStandings } from '@/lib/espn-fetchers'

export const runtime = 'nodejs'
export const alt = 'Eredivisie Stand'
export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'

export default async function Image() {
  const standings = await fetchStandings()
  const top3 = standings.slice(0, 3)

  return new ImageResponse(
    (
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          width: '100%',
          height: '100%',
          backgroundColor: '#f8f9fa',
          fontFamily: 'sans-serif',
          gap: 24,
        }}
      >
        <div style={{ fontSize: 48, fontWeight: 800, color: '#1a1a2e' }}>
          Eredivisie Stand
        </div>
        <div style={{ display: 'flex', gap: 40 }}>
          {top3.map((entry, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 12, fontSize: 32, fontWeight: 700, color: '#1a1a2e' }}>
              <span style={{ color: '#e01e36' }}>{entry.position}.</span>
              <span>{entry.club.name}</span>
              <span style={{ color: '#64748b', fontWeight: 500 }}>({entry.points}pt)</span>
            </div>
          ))}
        </div>
        <div style={{ fontSize: 20, color: '#94a3b8' }}>eredivisie.tv</div>
      </div>
    ),
    { ...size }
  )
}
```

- [ ] **Step 3: Create club OG image**

Create `src/app/club/[slug]/opengraph-image.tsx`:

```tsx
import { ImageResponse } from 'next/og'
import { slugToEspnId, slugToDisplayName } from '@/data/club-mapping'
import { fetchStandings } from '@/lib/espn-fetchers'

export const runtime = 'nodejs'
export const alt = 'Club'
export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'

export default async function Image({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const name = slugToDisplayName[slug] ?? slug
  const espnId = slugToEspnId[slug]
  const standings = await fetchStandings()
  const standing = standings.find((s) => s.club.id === espnId)

  return new ImageResponse(
    (
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          width: '100%',
          height: '100%',
          backgroundColor: '#f8f9fa',
          fontFamily: 'sans-serif',
          gap: 16,
        }}
      >
        <div style={{ fontSize: 56, fontWeight: 800, color: '#1a1a2e' }}>{name}</div>
        {standing && (
          <div style={{ fontSize: 28, color: '#64748b' }}>
            {standing.position}e plaats — {standing.points} punten
          </div>
        )}
        <div style={{ fontSize: 20, color: '#94a3b8', marginTop: 8 }}>eredivisie.tv</div>
      </div>
    ),
    { ...size }
  )
}
```

- [ ] **Step 4: Create match OG image**

Create `src/app/wedstrijd/[id]/opengraph-image.tsx`:

```tsx
import { ImageResponse } from 'next/og'
import { fetchMatchById } from '@/lib/espn-fetchers'

export const runtime = 'nodejs'
export const alt = 'Wedstrijd'
export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'

export default async function Image({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const match = await fetchMatchById(id)

  if (!match) {
    return new ImageResponse(
      (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '100%', height: '100%', backgroundColor: '#f8f9fa', fontFamily: 'sans-serif' }}>
          <div style={{ fontSize: 48, fontWeight: 800, color: '#1a1a2e' }}>eredivisie.tv</div>
        </div>
      ),
      { ...size }
    )
  }

  return new ImageResponse(
    (
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          width: '100%',
          height: '100%',
          backgroundColor: '#f8f9fa',
          fontFamily: 'sans-serif',
          gap: 24,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 32, fontSize: 48, fontWeight: 800, color: '#1a1a2e' }}>
          <span>{match.homeTeam.name}</span>
          <span style={{ color: '#e01e36' }}>vs</span>
          <span>{match.awayTeam.name}</span>
        </div>
        {match.score && (
          <div style={{ fontSize: 64, fontWeight: 800, color: '#1a1a2e' }}>
            {match.score.home} - {match.score.away}
          </div>
        )}
        <div style={{ fontSize: 20, color: '#94a3b8' }}>eredivisie.tv</div>
      </div>
    ),
    { ...size }
  )
}
```

- [ ] **Step 5: Verify build**

```bash
cd /Users/nickvelten/Projects/eredivisie-tv && npm run build
```

- [ ] **Step 6: Commit**

```bash
git add src/app/opengraph-image.tsx src/app/stand/opengraph-image.tsx src/app/club/\[slug\]/opengraph-image.tsx src/app/wedstrijd/\[id\]/opengraph-image.tsx
git commit -m "feat: add dynamic OG images for homepage, stand, club, and match pages"
```

---

## Task 17: Extended Sitemap

**Files:**
- Modify: `src/app/sitemap.ts`

- [ ] **Step 1: Update sitemap with all dynamic routes**

Replace `src/app/sitemap.ts`:

```ts
import type { MetadataRoute } from 'next'
import { espnIdToSlug } from '@/data/club-mapping'

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = 'https://eredivisie.tv'
  const now = new Date()

  // Static pages
  const staticPages: MetadataRoute.Sitemap = [
    { url: baseUrl, lastModified: now, changeFrequency: 'daily', priority: 1 },
    { url: `${baseUrl}/programma`, lastModified: now, changeFrequency: 'daily', priority: 0.9 },
    { url: `${baseUrl}/uitslagen`, lastModified: now, changeFrequency: 'daily', priority: 0.9 },
    { url: `${baseUrl}/stand`, lastModified: now, changeFrequency: 'daily', priority: 0.9 },
    { url: `${baseUrl}/topscorers`, lastModified: now, changeFrequency: 'daily', priority: 0.8 },
    { url: `${baseUrl}/kijken`, lastModified: now, changeFrequency: 'monthly', priority: 0.7 },
  ]

  // Club pages
  const clubPages: MetadataRoute.Sitemap = Object.values(espnIdToSlug).map((slug) => ({
    url: `${baseUrl}/club/${slug}`,
    lastModified: now,
    changeFrequency: 'daily' as const,
    priority: 0.7,
  }))

  return [...staticPages, ...clubPages]
}
```

Note: We don't include `/wedstrijd/[id]` in the sitemap because match IDs are ephemeral ESPN IDs — they'd bloat the sitemap and Google can discover them via internal links.

- [ ] **Step 2: Verify build**

```bash
cd /Users/nickvelten/Projects/eredivisie-tv && npm run build
```

- [ ] **Step 3: Commit**

```bash
git add src/app/sitemap.ts
git commit -m "feat: extend sitemap with all static and club pages"
```

---

## Task 18: Final Integration — Build & Smoke Test

- [ ] **Step 1: Run full build**

```bash
cd /Users/nickvelten/Projects/eredivisie-tv && npm run build
```

Fix any type errors or build failures.

- [ ] **Step 2: Start dev server and test key pages**

```bash
cd /Users/nickvelten/Projects/eredivisie-tv && npm run dev
```

Visit and verify:
- `http://localhost:3000` — Homepage hub with compact stand, topscorer spotlight
- `http://localhost:3000/programma` — Match schedule with nav and filter
- `http://localhost:3000/uitslagen` — Results with filter
- `http://localhost:3000/stand` — Full standings table
- `http://localhost:3000/topscorers` — Top scorers and assists
- `http://localhost:3000/club/ajax` — Club page with matches and stats
- `http://localhost:3000/kijken` — Providers, comparison table, FAQ
- `http://localhost:3000/api/scores` — JSON response with live scores

- [ ] **Step 3: Verify live score polling**

Open browser devtools Network tab on any page with matches. Confirm `/api/scores` is being polled every 30 seconds when there are live matches.

- [ ] **Step 4: Verify favourite club feature**

Select a club from the header dropdown. Verify:
- Club is highlighted in the standings table
- Filter toggle appears in programma and uitslagen
- Preference persists across page reload

- [ ] **Step 5: Final commit if any fixes were needed**

```bash
git add -A
git commit -m "fix: integration fixes from smoke testing"
```
