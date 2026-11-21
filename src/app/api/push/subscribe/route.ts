import { fetchEredivisieData } from '@/lib/espn'
import { pushConfigured, removeSubscription, saveSubscription, validSubscription } from '@/lib/push'

/** Body: { subscription, clubId, previousClubId? }. Moves the subscription to the (new) club. */
export async function POST(req: Request) {
  if (!pushConfigured()) return Response.json({ error: 'Meldingen zijn nog niet beschikbaar' }, { status: 503 })
  const body = (await req.json().catch(() => null)) as { subscription?: unknown; clubId?: unknown; previousClubId?: unknown } | null
  if (!body || !validSubscription(body.subscription) || typeof body.clubId !== 'string') {
    return Response.json({ error: 'Ongeldige aanvraag' }, { status: 400 })
  }
  const { clubs } = await fetchEredivisieData()
  if (!clubs.some((c) => c.id === body.clubId)) return Response.json({ error: 'Onbekende club' }, { status: 400 })
  if (typeof body.previousClubId === 'string' && body.previousClubId !== body.clubId && /^\d{1,8}$/.test(body.previousClubId)) {
    await removeSubscription(body.previousClubId, body.subscription.endpoint)
  }
  await saveSubscription(body.clubId, body.subscription)
  return Response.json({ ok: true })
}
