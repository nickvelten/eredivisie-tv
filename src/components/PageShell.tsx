import { cookies } from 'next/headers'
import { ReactNode } from 'react'
import { EredivisieData } from '@/data/types'
import { FavoriteClubProvider, FAVORITE_COOKIE } from '@/lib/favorite-club'
import { Header } from './Header'
import { LiveBar } from './LiveBar'
import { Footer } from './Footer'

/**
 * Shared chrome for every page: reads the favourite-club cookie on the server
 * (so the first paint already knows the favourite, no layout shift), and
 * renders header, live bar, content and footer.
 */
export async function PageShell({
  data,
  showSections = false,
  children,
}: {
  data: EredivisieData
  showSections?: boolean
  children: ReactNode
}) {
  const cookieStore = await cookies()
  const favoriteCookie = cookieStore.get(FAVORITE_COOKIE)?.value ?? null
  const initialFavoriteId = data.clubs.some((c) => c.id === favoriteCookie) ? favoriteCookie : null

  return (
    <FavoriteClubProvider clubs={data.clubs} initialFavoriteId={initialFavoriteId}>
      <Header clubs={data.clubs} showSections={showSections} />
      <LiveBar matches={data.allMatches} />
      <main className="flex-1">{children}</main>
      <Footer />
    </FavoriteClubProvider>
  )
}
