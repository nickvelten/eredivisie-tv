import { findClubBySlug } from '@/lib/espn'
import { clubTheme } from '@/lib/color'
import { ogCard, OG_SIZE } from '@/lib/og'

export const alt = 'Clubpagina op Eredivisie.tv'
export const size = OG_SIZE
export const contentType = 'image/png'

export default async function Image({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const result = await findClubBySlug(slug)
  if (!result) return ogCard({ title: 'Eredivisie op TV' })
  const { club, data } = result
  const theme = clubTheme(club.color)
  const standing = data.standings.find((s) => s.club.id === club.id)
  return ogCard({
    eyebrow: 'Programma · zender · uitslagen',
    title: `${club.name} op TV`,
    subtitle: standing ? `${standing.position}e in de Eredivisie · ${standing.points} punten` : undefined,
    logos: [club.logo],
    color: theme.heroFrom,
    colorTo: theme.heroTo,
  })
}
