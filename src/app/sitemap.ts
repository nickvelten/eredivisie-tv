import type { MetadataRoute } from 'next'
import { fetchEredivisieData } from '@/lib/espn'
import { SITE_URL } from '@/lib/structured-data'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const { clubs, allMatches } = await fetchEredivisieData()
  const now = new Date()

  return [
    { url: SITE_URL, lastModified: now, changeFrequency: 'hourly', priority: 1 },
    ...clubs.map((club) => ({
      url: `${SITE_URL}/club/${club.slug}`,
      lastModified: now,
      changeFrequency: 'daily' as const,
      priority: 0.8,
    })),
    ...allMatches.map((match) => ({
      url: `${SITE_URL}/wedstrijd/${match.id}`,
      lastModified: match.status === 'finished' ? new Date(match.date) : now,
      changeFrequency: match.status === 'finished' ? ('monthly' as const) : ('daily' as const),
      priority: match.status === 'finished' ? 0.4 : 0.7,
    })),
  ]
}
