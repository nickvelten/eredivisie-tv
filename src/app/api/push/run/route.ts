import { fetchLiveUpdates, fetchEredivisieData } from '@/lib/espn'
import { claim, pushConfigured, sendToClubs } from '@/lib/push'
import { formatTime } from '@/lib/utils'

export const dynamic = 'force-dynamic'

const BEFORE_KICKOFF_MS = 75 * 60_000 // the scheduler runs every ~10 minutes, often a bit late
const RESULT_WINDOW_MS = 4 * 3600_000

/**
 * Called on a schedule (GitHub Actions, every 10 minutes). Sends "starts soon"
 * and "full time" notifications to the followers of both clubs. Safe to call
 * any number of times: every notification is claimed once.
 */
export async function GET() {
  if (!pushConfigured()) return Response.json({ skipped: 'not configured' })
  const [{ allMatches }, live] = await Promise.all([fetchEredivisieData(), fetchLiveUpdates().catch(() => [])])
  const liveById = new Map(live.map((u) => [u.id, u]))
  const now = Date.now()
  const log: string[] = []

  for (const m of allMatches) {
    const kickoff = new Date(m.date).getTime()
    const update = liveById.get(m.id)
    const status = update?.status ?? m.status
    const score = update?.score ?? m.score
    const clubs = [m.homeTeam.id, m.awayTeam.id]
    const url = `/wedstrijd/${m.slug}`
    const name = `${m.homeTeam.shortName} – ${m.awayTeam.shortName}`

    if (status === 'scheduled' && kickoff > now && kickoff - now <= BEFORE_KICKOFF_MS && (await claim(`${m.id}-start`))) {
      const tv = m.broadcasts.find((b) => b.type === 'tv')?.name ?? 'ESPN'
      const r = await sendToClubs(clubs, {
        title: `${name} om ${formatTime(m.date)}`,
        body: `Live op ${tv}. Tik voor opstelling, vorm en de stand.`,
        url,
        tag: `${m.id}-start`,
      })
      log.push(`${m.id} start: ${r.sent}`)
    }

    if (status === 'finished' && score && now - kickoff <= RESULT_WINDOW_MS && now > kickoff && (await claim(`${m.id}-end`))) {
      const r = await sendToClubs(clubs, {
        title: `Eindstand: ${m.homeTeam.shortName} ${score.home}-${score.away} ${m.awayTeam.shortName}`,
        body: 'Bekijk het verloop en de nieuwe stand.',
        url,
        tag: `${m.id}-end`,
      })
      log.push(`${m.id} end: ${r.sent}`)
    }
  }
  return Response.json({ ok: true, log })
}
