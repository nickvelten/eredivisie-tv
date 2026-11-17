import { fetchEredivisieData } from '@/lib/espn'
import { leagueCalendar } from '@/lib/ics'

export const revalidate = 1800

/** Subscribable calendar with every Eredivisie match of the season, with the ESPN channel. */
export async function GET() {
  const { allMatches } = await fetchEredivisieData()
  return new Response(leagueCalendar(allMatches), {
    headers: {
      'Content-Type': 'text/calendar; charset=utf-8',
      'Content-Disposition': 'inline; filename="eredivisie.ics"',
      'Cache-Control': 'public, max-age=1800',
    },
  })
}
