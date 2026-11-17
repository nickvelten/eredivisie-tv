import { fetchLiveUpdates } from '@/lib/espn'

// Fresh enough for live scores, cheap enough for many visitors
export const revalidate = 30

export async function GET() {
  return Response.json(await fetchLiveUpdates())
}
