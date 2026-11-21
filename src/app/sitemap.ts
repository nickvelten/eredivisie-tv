import type { MetadataRoute } from 'next'
import { duelSlug, fetchEredivisieData, fetchStadiums, seasonOptions } from '@/lib/espn'
import { SITE_URL } from '@/lib/structured-data'

// Main sitemap; players have their own at /speler/sitemap.xml.
// Built per request (from cached ESPN data). A revalidate here was not
// honoured: the sitemap stayed frozen at build time.
export const dynamic = 'force-dynamic'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [{ clubs, allMatches, matchweeks }, stadiums, seasons] = await Promise.all([fetchEredivisieData(), fetchStadiums(), seasonOptions()])
  const finished = allMatches.filter((m) => m.status === 'finished')
  // The date of the most recent result: when standings, scorers and club pages last changed
  const lastResult = finished.reduce<Date>((latest, m) => {
    const d = new Date(m.date)
    return d > latest ? d : latest
  }, new Date(0))
  const now = new Date()
  const latestFor = (clubId: string) =>
    finished
      .filter((m) => m.homeTeam.id === clubId || m.awayTeam.id === clubId)
      .reduce<Date>((latest, m) => (new Date(m.date) > latest ? new Date(m.date) : latest), lastResult)

  const duels = new Map<string, Date>()
  for (const m of allMatches) {
    const slug = duelSlug(m.homeTeam, m.awayTeam)
    const d = m.status === 'finished' ? new Date(m.date) : lastResult
    if (!duels.has(slug) || d > duels.get(slug)!) duels.set(slug, d)
  }

  return [
    { url: SITE_URL, lastModified: now },
    { url: `${SITE_URL}/eredivisie-op-tv-vandaag`, lastModified: now },
    { url: `${SITE_URL}/programma`, lastModified: lastResult },
    { url: `${SITE_URL}/uitslagen`, lastModified: lastResult },
    { url: `${SITE_URL}/stand`, lastModified: lastResult },
    { url: `${SITE_URL}/topscorers`, lastModified: lastResult },
    { url: `${SITE_URL}/clubs`, lastModified: lastResult },
    ...clubs.map((club) => ({ url: `${SITE_URL}/club/${club.slug}`, lastModified: latestFor(club.id) })),
    ...allMatches.map((match) => ({
      url: `${SITE_URL}/wedstrijd/${match.slug}`,
      lastModified: match.status === 'finished' ? new Date(match.date) : lastResult,
    })),
    ...[...duels].map(([slug, lastModified]) => ({ url: `${SITE_URL}/duel/${slug}`, lastModified })),
    { url: `${SITE_URL}/eredivisie-op-tv-morgen`, lastModified: now },
    { url: `${SITE_URL}/statistieken`, lastModified: lastResult },
    { url: `${SITE_URL}/vergelijk`, lastModified: lastResult },
    { url: `${SITE_URL}/eerste-divisie`, lastModified: now },
    { url: `${SITE_URL}/knvb-beker`, lastModified: now },
    { url: `${SITE_URL}/widget-insluiten`, lastModified: lastResult },
    ...matchweeks
      .filter((w) => w.round)
      .map((w) => ({
        url: `${SITE_URL}/speelronde/${w.round}`,
        lastModified: w.matches.every((m) => m.status === 'finished') ? new Date(w.matches[w.matches.length - 1].date) : lastResult,
      })),
    ...stadiums.map((s) => ({ url: `${SITE_URL}/stadion/${s.slug}`, lastModified: lastResult })),
    // Archived seasons no longer change
    ...seasons
      .filter((o) => !o.isCurrent)
      .flatMap((o) => ['stand', 'topscorers', 'uitslagen'].map((section) => ({ url: `${SITE_URL}/${section}/${o.slug}`, lastModified: new Date(Date.UTC(o.year + 1, 5, 1)) }))),
  ]
}
