import { createHash } from 'node:crypto'
import { del, get, head, list, put } from '@vercel/blob'
import * as webpush from 'web-push'

/**
 * Web push for "my club": one private Vercel Blob per subscription under
 * push/subs/<clubId>/, and a marker under push/sent/ per sent notification so
 * nothing goes out twice. No names or e-mail addresses: only the endpoint the
 * browser creates and the club it follows.
 */

export type StoredSubscription = { endpoint: string; keys: { p256dh: string; auth: string } }

const SUBS = 'push/subs'
const SENT = 'push/sent'

export function pushConfigured(): boolean {
  return !!process.env.BLOB_READ_WRITE_TOKEN
}

// The VAPID key pair is created by the server on first use and kept in the
// private blob store, so the private key never has to be handled by a person.
const VAPID_PATH = 'push/vapid.json'
type VapidKeys = { publicKey: string; privateKey: string }
let vapid: Promise<VapidKeys> | null = null

async function loadOrCreateVapid(): Promise<VapidKeys> {
  const existing = await readJson<VapidKeys>(VAPID_PATH).catch(() => null)
  if (existing?.publicKey && existing.privateKey) return existing
  const keys = webpush.generateVAPIDKeys()
  try {
    await put(VAPID_PATH, JSON.stringify(keys), { access: 'private', addRandomSuffix: false, allowOverwrite: false, contentType: 'application/json' })
    return keys
  } catch {
    // Another request created it first
    const created = await readJson<VapidKeys>(VAPID_PATH)
    if (!created) throw new Error('VAPID keys unavailable')
    return created
  }
}

function getVapid(): Promise<VapidKeys> {
  vapid ??= loadOrCreateVapid().catch((e) => {
    vapid = null
    throw e
  })
  return vapid
}

export async function vapidPublicKey(): Promise<string> {
  return (await getVapid()).publicKey
}

async function ensureVapid() {
  const keys = await getVapid()
  webpush.setVapidDetails('mailto:hey@nickvelten.nl', keys.publicKey, keys.privateKey)
}

// Only real browser push services, so the endpoint cannot be used to make us call arbitrary URLs
const PUSH_HOSTS = [/\.googleapis\.com$/, /\.mozilla\.com$/, /\.push\.apple\.com$/, /\.notify\.windows\.com$/, /^web\.push\.apple\.com$/]

export function validSubscription(value: unknown): value is StoredSubscription {
  if (!value || typeof value !== 'object') return false
  const s = value as StoredSubscription
  if (typeof s.endpoint !== 'string' || s.endpoint.length > 1000) return false
  if (typeof s.keys?.p256dh !== 'string' || typeof s.keys?.auth !== 'string' || s.keys.p256dh.length > 200 || s.keys.auth.length > 100) return false
  try {
    const url = new URL(s.endpoint)
    return url.protocol === 'https:' && PUSH_HOSTS.some((re) => re.test(url.hostname))
  } catch {
    return false
  }
}

function subPath(clubId: string, endpoint: string): string {
  return `${SUBS}/${clubId}/${createHash('sha256').update(endpoint).digest('hex').slice(0, 32)}.json`
}

export async function saveSubscription(clubId: string, sub: StoredSubscription): Promise<void> {
  const body: StoredSubscription = { endpoint: sub.endpoint, keys: { p256dh: sub.keys.p256dh, auth: sub.keys.auth } }
  await put(subPath(clubId, sub.endpoint), JSON.stringify(body), {
    access: 'private',
    addRandomSuffix: false,
    allowOverwrite: true,
    contentType: 'application/json',
  })
}

export async function removeSubscription(clubId: string, endpoint: string): Promise<void> {
  await del(subPath(clubId, endpoint)).catch(() => {})
}

async function readJson<T>(pathname: string): Promise<T | null> {
  const res = await get(pathname, { access: 'private', useCache: false })
  if (!res || res.statusCode !== 200) return null
  return JSON.parse(await new Response(res.stream).text()) as T
}

async function subscriptionsFor(clubId: string): Promise<{ pathname: string; sub: StoredSubscription }[]> {
  const out: { pathname: string; sub: StoredSubscription }[] = []
  let cursor: string | undefined
  do {
    const page = await list({ prefix: `${SUBS}/${clubId}/`, cursor, limit: 1000 })
    const subs = await Promise.all(page.blobs.map(async (b) => ({ pathname: b.pathname, sub: await readJson<StoredSubscription>(b.pathname) })))
    for (const s of subs) if (s.sub) out.push({ pathname: s.pathname, sub: s.sub })
    cursor = page.hasMore ? page.cursor : undefined
  } while (cursor)
  return out
}

/** Claims a notification key; false when it was already sent. */
export async function claim(key: string): Promise<boolean> {
  const pathname = `${SENT}/${key}`
  try {
    await head(pathname)
    return false
  } catch {
    await put(pathname, '1', { access: 'private', addRandomSuffix: false, allowOverwrite: true, contentType: 'text/plain' })
    return true
  }
}

export type PushMessage = { title: string; body: string; url: string; tag: string }

/** Sends to everyone following one of the clubs; drops subscriptions the push service no longer knows. */
export async function sendToClubs(clubIds: string[], message: PushMessage): Promise<{ sent: number; removed: number }> {
  await ensureVapid()
  let sent = 0
  let removed = 0
  const seen = new Set<string>()
  for (const clubId of clubIds) {
    for (const { pathname, sub } of await subscriptionsFor(clubId)) {
      if (seen.has(sub.endpoint)) continue
      seen.add(sub.endpoint)
      try {
        await webpush.sendNotification(sub, JSON.stringify(message), { TTL: 3600, urgency: 'high' })
        sent++
      } catch (e) {
        const status = (e as { statusCode?: number }).statusCode
        if (status === 404 || status === 410) {
          await del(pathname).catch(() => {})
          removed++
        }
      }
    }
  }
  return { sent, removed }
}
