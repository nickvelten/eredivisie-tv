import { findClubBySlug } from '@/lib/espn'
import { clubCalendar } from '@/lib/ics'

/** Subscribable calendar feed with every match of one club this season. */
export async function GET(_req: Request, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const result = await findClubBySlug(slug)
  if (!result) return new Response('Club niet gevonden', { status: 404 })

  const { club, data } = result
  return new Response(clubCalendar(club, data.allMatches), {
    headers: {
      'Content-Type': 'text/calendar; charset=utf-8',
      'Content-Disposition': `inline; filename="${club.slug}.ics"`,
      'Cache-Control': 'public, max-age=1800',
    },
  })
}
