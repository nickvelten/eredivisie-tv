import { buildSearchIndex } from '@/lib/search'

// Rebuilt at most once an hour; the search box loads it on first focus.
export const revalidate = 3600

export async function GET() {
  return Response.json(await buildSearchIndex())
}
