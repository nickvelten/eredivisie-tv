import type { MetadataRoute } from 'next'
import { fetchEredivisieData } from '@/lib/espn'
import { fetchAllPlayers } from '@/lib/players'
import { SITE_URL } from '@/lib/structured-data'

// Built per request (from cached ESPN data). A revalidate here was not
// honoured: the sitemap stayed frozen at build time.
export const dynamic = 'force-dynamic'

/**
 * Player sitemap (/speler/sitemap.xml), separate so Search Console shows how
 * player pages get indexed. Only players who have played this season are
 * listed; the rest are noindex until their debut.
 */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [players, { allMatches }] = await Promise.all([fetchAllPlayers(), fetchEredivisieData()])
  const lastResultFor = (clubId: string) =>
    allMatches
      .filter((m) => m.status === 'finished' && (m.homeTeam.id === clubId || m.awayTeam.id === clubId))
      .reduce<Date>((latest, m) => (new Date(m.date) > latest ? new Date(m.date) : latest), new Date(0))
  return players
    .filter((p) => p.stats.appearances > 0)
    .map((p) => ({ url: `${SITE_URL}/speler/${p.slug}`, lastModified: lastResultFor(p.club.id) }))
}
