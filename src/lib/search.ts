import { fetchEredivisieData } from '@/lib/espn'
import { fetchAllPlayers } from '@/lib/players'
import { formatShortDate } from '@/lib/utils'

import { normalize, type SearchItem } from '@/lib/search-shared'

export { normalize, searchItems, type SearchItem } from '@/lib/search-shared'

const PAGES: Array<Pick<SearchItem, 'title' | 'subtitle' | 'href'> & { extra: string }> = [
  { title: 'Op TV vandaag', subtitle: 'Welke wedstrijden en op welke zender', href: '/eredivisie-op-tv-vandaag', extra: 'vandaag zender tv espn kijken' },
  { title: 'Programma', subtitle: 'Alle komende wedstrijden', href: '/programma', extra: 'speelschema agenda' },
  { title: 'Uitslagen', subtitle: 'Alle gespeelde wedstrijden', href: '/uitslagen', extra: 'scores resultaten' },
  { title: 'Stand', subtitle: 'De actuele Eredivisie-stand', href: '/stand', extra: 'ranglijst klassement' },
  { title: 'Topscorers', subtitle: 'Doelpunten en assists', href: '/topscorers', extra: 'goals assists' },
  { title: 'Clubs', subtitle: 'Alle 18 Eredivisie-clubs', href: '/clubs', extra: 'teams' },
]

/** Everything the search box can find. Built from cached ESPN data. */
export async function buildSearchIndex(): Promise<SearchItem[]> {
  const [data, players] = await Promise.all([fetchEredivisieData(), fetchAllPlayers()])
  const now = Date.now()
  const day = 86_400_000

  const clubs: SearchItem[] = data.clubs.map((c) => ({
    type: 'club',
    title: c.name,
    subtitle: 'Club',
    href: `/club/${c.slug}`,
    image: c.logo,
    terms: normalize(`${c.name} ${c.shortName} ${c.slug.replace(/-/g, ' ')}`),
  }))

  const squad: SearchItem[] = players.map((p) => ({
    type: 'speler',
    title: p.name,
    subtitle: `${p.position} · ${p.club.shortName}`,
    href: `/speler/${p.slug}`,
    image: p.club.logo,
    terms: normalize(`${p.name} ${p.club.shortName}`),
  }))

  // Matches from two weeks back to the end of the fetched window
  const matches: SearchItem[] = data.allMatches
    .filter((m) => new Date(m.date).getTime() > now - 14 * day)
    .map((m) => ({
      type: 'wedstrijd',
      title: `${m.homeTeam.shortName} – ${m.awayTeam.shortName}`,
      subtitle: m.status === 'finished' && m.score ? `Uitslag ${m.score.home}-${m.score.away}` : formatShortDate(m.date),
      href: `/wedstrijd/${m.slug}`,
      image: m.homeTeam.logo,
      terms: normalize(`${m.homeTeam.name} ${m.homeTeam.shortName} ${m.awayTeam.name} ${m.awayTeam.shortName}`),
    }))

  const pages: SearchItem[] = PAGES.map((p) => ({ type: 'pagina', ...p, terms: normalize(`${p.title} ${p.extra}`) }))

  return [...pages, ...clubs, ...matches, ...squad]
}

