import { pushConfigured, vapidPublicKey } from '@/lib/push'

export const dynamic = 'force-dynamic'

/** The public VAPID key the browser needs to subscribe. */
export async function GET() {
  if (!pushConfigured()) return Response.json({ error: 'Meldingen zijn nog niet beschikbaar' }, { status: 503 })
  return Response.json({ publicKey: await vapidPublicKey() }, { headers: { 'Cache-Control': 'public, max-age=3600' } })
}
