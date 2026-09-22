import { findMatchById } from '@/lib/espn'
import { matchCalendar } from '@/lib/ics'

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const result = await findMatchById(id)
  if (!result) return new Response('Wedstrijd niet gevonden', { status: 404 })

  const { match } = result
  const filename = `${match.homeTeam.slug}-${match.awayTeam.slug}.ics`
  return new Response(matchCalendar(match), {
    headers: {
      'Content-Type': 'text/calendar; charset=utf-8',
      'Content-Disposition': `attachment; filename="${filename}"`,
      'Cache-Control': 'public, max-age=300',
    },
  })
}
