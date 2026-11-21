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
  { title: 'Dit weekend', subtitle: 'Alle wedstrijden van vrijdag tot zondag', href: '/eredivisie-dit-weekend', extra: 'weekend zaterdag zondag vrijdag' },
  { title: 'Thuisstand', subtitle: 'De stand in eigen huis', href: '/stand/thuis', extra: 'thuis stand' },
  { title: 'Uitstand', subtitle: 'De stand buiten de deur', href: '/stand/uit', extra: 'uit stand' },
  { title: 'Vormtabel', subtitle: 'De stand over de laatste 5 wedstrijden', href: '/stand/vorm', extra: 'vorm laatste 5' },
  { title: 'Restprogramma', subtitle: 'Wie heeft het zwaarste programma?', href: '/restprogramma', extra: 'resterend programma tegenstanders' },
  { title: 'Standcalculator', subtitle: 'Reken de stand door', href: '/standcalculator', extra: 'calculator voorspellen' },
  { title: 'Eredivisie kijken zonder Ziggo', subtitle: 'KPN, Odido en Canal Digitaal', href: '/gids/eredivisie-kijken-zonder-ziggo', extra: 'kpn odido canal digitaal ziggo' },
  { title: 'ESPN-abonnement vergelijken', subtitle: 'Prijzen per provider', href: '/gids/espn-abonnement-vergelijken', extra: 'espn prijs kosten abonnement' },
  { title: 'Eredivisie kijken in het buitenland', subtitle: 'Op vakantie of in het buitenland', href: '/gids/eredivisie-kijken-in-het-buitenland', extra: 'buitenland vakantie eu' },
  { title: 'ESPN 1', subtitle: 'Eredivisie op ESPN 1', href: '/zender/espn-1', extra: 'espn1 zender' },
  { title: 'ESPN 2', subtitle: 'Eredivisie op ESPN 2', href: '/zender/espn-2', extra: 'espn2 zender' },
  { title: 'ESPN 3', subtitle: 'Eredivisie op ESPN 3', href: '/zender/espn-3', extra: 'espn3 zender' },
  { title: 'ESPN 4', subtitle: 'Eredivisie op ESPN 4', href: '/zender/espn-4', extra: 'espn4 zender' },
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

