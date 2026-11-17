import { findMatch } from '@/lib/espn'
import { clubTheme } from '@/lib/color'
import { ogCard, OG_SIZE } from '@/lib/og'
import { formatDutchDate, formatTime } from '@/lib/utils'

export const alt = 'Wedstrijd op Eredivisie.tv'
export const size = OG_SIZE
export const contentType = 'image/png'

export default async function Image({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const result = await findMatch(slug)
  if (!result) return ogCard({ title: 'Eredivisie op TV' })
  const { match } = result
  const theme = clubTheme(match.homeTeam.color)
  const tv = match.broadcasts.find((b) => b.type === 'tv')?.name ?? 'ESPN'
  const finished = match.status === 'finished' && match.score
  return ogCard({
    eyebrow: finished ? 'Uitslag' : `${formatDutchDate(match.date)} · ${formatTime(match.date)}`,
    title: finished
      ? `${match.homeTeam.shortName} ${match.score!.home}-${match.score!.away} ${match.awayTeam.shortName}`
      : `${match.homeTeam.shortName} – ${match.awayTeam.shortName}`,
    subtitle: finished ? 'Eredivisie' : `Live op ${tv}`,
    logos: [match.homeTeam.logo, match.awayTeam.logo],
    color: theme.heroFrom,
    colorTo: theme.heroTo,
  })
}
