# eredivisie.tv v2 — Design Spec

## Overview

Evolve eredivisie.tv from a single-page app to a full multi-page Next.js site with live scores, club pages, match pages, favourite club support, and expanded SEO. ESPN API remains the data source.

## Site Structure

```
/                       → Homepage hub (highlights, compact widgets, CTAs)
/programma              → Full match schedule per matchweek
/uitslagen              → All results per matchweek
/stand                  → Full Eredivisie standings table
/topscorers             → Top scorers & assists tables
/club/[slug]            → Club page (schedule, results, position)
/wedstrijd/[id]         → Match detail (odds, broadcast, live score)
/kijken                 → Provider comparison + FAQ
/api/scores             → Live score polling endpoint
```

## Live Scores

**Problem:** Current ISR revalidation of 3600s means scores are up to 1 hour stale during live matches.

**Solution:** Client-side polling with server-side proxy.

- ISR stays at 3600s for all pages (good for SEO crawlers)
- `LiveScoreProvider` context wraps pages that show matches
- On mount, checks if any matches have `status: 'live'` or are within 30 minutes of kickoff
- If yes, polls `/api/scores` every 30 seconds
- `/api/scores` is a Next.js route handler that proxies the ESPN scoreboard API with 30s cache headers
- Scores update in-place without page reload
- Pulsing red dot on live matches

### `/api/scores` route

```ts
// Returns: { matches: Array<{ id, status, score }> }
// Cache: Cache-Control: public, s-maxage=30
```

## Favourite Club

- `FavoriteClubContext` with React context + localStorage persistence
- Club selector dropdown in the header (small, with club logos)
- Selected club gets subtle highlight in standings (light accent background row)
- Filter toggle in /programma and /uitslagen: "Toon alleen mijn club"
- No favourite selected by default — fully optional

## Page Designs

### Homepage (`/`)

Compact hub that drives traffic to sub-pages:

1. **"Vandaag op TV" highlight** — Today's matches with live scores, or next match day with countdown timer
2. **Compacte stand** — Top 5 + user's favourite club (if set) + link to /stand
3. **Eerstvolgende speelronde** — Next 3-4 upcoming matches + link to /programma
4. **Topscorer spotlight** — #1 scorer with stats + link to /topscorers
5. **Quick links** to all sections

### Programma (`/programma`)

- Full matchweek navigator (prev/next arrows + matchweek number)
- Matches grouped by date
- Match cards with time, teams, broadcast info, Unibet odds
- Live score updates via polling
- Filter toggle for favourite club
- Each match links to `/wedstrijd/[id]`

### Uitslagen (`/uitslagen`)

- Matchweek navigator for finished matchweeks
- Results grouped by date
- Centered layout: Home — Score — Away
- Each result links to `/wedstrijd/[id]`
- Filter toggle for favourite club

### Stand (`/stand`)

- Full 18-team standings table
- Position color coding (CL, EL, ECL, playoffs, relegation)
- Legend below table
- Favourite club highlighted
- Goal difference columns visible on desktop

### Topscorers (`/topscorers`)

- Tab toggle: Doelpunten / Assists
- Table with position, flag, player name, matches, goals/assists
- Top 3 highlighted

### Club Page (`/club/[slug]`)

- Club header: logo, full name, current league position, points
- **Aankomende wedstrijden** — Next 5 scheduled matches with date/time/opponent
- **Recente resultaten** — Last 5 finished matches with scores
- **Seizoensstatistieken** — W/G/V record, goals for/against, points
- No Unibet CTAs on club pages
- Breadcrumb: Home > Club > [Club name]

### Wedstrijd Page (`/wedstrijd/[id]`)

- Match header: home team vs away team with logos
- Date, time, broadcast channel
- Live score with polling (if live)
- Unibet odds + CTA (if scheduled)
- Final score (if finished)
- Breadcrumb: Home > Wedstrijd > [Home] vs [Away]

### Kijken (`/kijken`)

- Intro text: ESPN as official broadcaster
- Provider cards (current design)
- **Vergelijkingstabel**: rows = providers, columns = prijs, kanalen, type (kabel/stream/app)
- **FAQ section** with structured data:
  - "Waar kan ik de Eredivisie kijken?"
  - "Hoeveel kost ESPN?"
  - "Kan ik de Eredivisie gratis kijken?"
  - "Welke provider heeft alle ESPN-kanalen?"

## SEO & Structured Data

### Per-page metadata

Every page gets unique `title`, `description`, `canonical`, and `openGraph` metadata.

Examples:
- `/stand` → "Eredivisie Stand 2025/26 — Actuele ranglijst"
- `/club/ajax` → "Ajax — Eredivisie programma, uitslagen & stand"
- `/wedstrijd/123` → "AZ - Fortuna Sittard — Eredivisie wedstrijd"

### JSON-LD

- **Homepage**: `WebSite` schema
- **Wedstrijd pages**: `SportsEvent` schema
- **Club pages**: `SportsTeam` schema
- **Kijken page**: `FAQPage` schema

### Dynamic OG Images

Using `next/og` (ImageResponse):
- **Homepage**: Eredivisie logo + "Alle wedstrijden op TV"
- **Stand page**: Top 3 clubs with points
- **Club page**: Club logo + position + points
- **Wedstrijd page**: Home vs Away with logos

### Sitemap

Extend `sitemap.ts` to include all dynamic routes:
- All club pages (18 slugs)
- All upcoming/recent match pages
- All static pages

### robots.ts

Keep as-is (already configured).

## UX Extras

- **Countdown timer**: On homepage, shows time until next kickoff (client component, updates every second)
- **Back to top FAB**: Floating button on scroll, appears after 400px scroll
- **Active page indicator**: Header nav highlights current page
- **Mobile navigation**: Bottom bar or hamburger with page links (replaces anchor-based mobile nav)
- **Breadcrumbs**: On sub-pages for navigation context
- **Error states**: User-friendly message when ESPN API fails ("Data tijdelijk niet beschikbaar, probeer het later opnieuw")

## Data Layer Changes

### clubs.ts

Add `slug` field to each club for URL routing:

```ts
type Club = {
  id: string        // ESPN ID
  slug: string      // URL slug: 'ajax', 'psv', 'feyenoord'
  name: string
  shortName: string
  logo: string
}
```

### ESPN fetch functions

Split `fetchEredivisieData()` into focused functions:

- `fetchMatches(weekRange?)` — Scoreboard data for a date range
- `fetchStandings()` — Current standings
- `fetchLeaders()` — Top scorers and assisters
- `fetchMatchById(id)` — Single match detail
- `fetchLiveScores()` — Minimal payload for polling (id, status, score only)

Each function handles its own caching/revalidation.

### ESPN team ID to slug mapping

Map ESPN team IDs to club slugs for linking:

```ts
const espnIdToSlug: Record<string, string> = {
  '174': 'ajax',
  '148': 'feyenoord',
  // ...
}
```

## Visual Style

Keep current light theme and Eredivisie red accent. No changes to color scheme or typography.

## Tech Stack

- Next.js 16 + TypeScript + Tailwind CSS 4
- ESPN API (public, no key required)
- `next/og` for dynamic OG images
- localStorage for favourite club
- No database, no auth
