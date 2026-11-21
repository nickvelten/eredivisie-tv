import { pushConfigured, removeSubscription } from '@/lib/push'

/** Body: { endpoint, clubId } */
export async function POST(req: Request) {
  if (!pushConfigured()) return Response.json({ ok: true })
  const body = (await req.json().catch(() => null)) as { endpoint?: unknown; clubId?: unknown } | null
  if (!body || typeof body.endpoint !== 'string' || typeof body.clubId !== 'string' || !/^\d{1,8}$/.test(body.clubId)) {
    return Response.json({ error: 'Ongeldige aanvraag' }, { status: 400 })
  }
  await removeSubscription(body.clubId, body.endpoint)
  return Response.json({ ok: true })
}
