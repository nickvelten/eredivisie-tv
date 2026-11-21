import { fetchEredivisieData } from '@/lib/espn'
import { ogCard, OG_SIZE } from '@/lib/og'
import { formatDutchDate, formatTime, isToday } from '@/lib/utils'

export const alt = 'Eredivisie op TV vandaag'
export const size = OG_SIZE
export const contentType = 'image/png'
export const revalidate = 300

/** Today's matches on the social card, so a shared link shows the actual programme. */
export default async function Image() {
  const { allMatches } = await fetchEredivisieData()
  const today = allMatches.filter((m) => isToday(m.date)).sort((a, b) => a.date.localeCompare(b.date))
  if (today.length === 0) {
    return ogCard({ eyebrow: 'Eredivisie op TV vandaag', title: 'Vandaag geen Eredivisie', subtitle: 'Bekijk het programma van de komende dagen' })
  }
  const lines = today.slice(0, 4).map((m) => `${formatTime(m.date)} ${m.homeTeam.shortName} – ${m.awayTeam.shortName}`)
  return ogCard({
    eyebrow: `Op TV vandaag · ${formatDutchDate(today[0].date)}`,
    title: today.length === 1 ? `${today[0].homeTeam.name} – ${today[0].awayTeam.name}` : `${today.length} wedstrijden live op ESPN`,
    subtitle: today.length === 1 ? `${formatTime(today[0].date)} op ${today[0].broadcasts.find((b) => b.type === 'tv')?.name ?? 'ESPN'}` : lines.join('  ·  ') + (today.length > 4 ? '  ·  …' : ''),
  })
}
