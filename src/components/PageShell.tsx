import { ReactNode } from 'react'
import { EredivisieData } from '@/data/types'
import { FavoriteClubProvider } from '@/lib/favorite-club'
import { Header } from './Header'
import { LiveBar } from './LiveBar'
import { Footer } from './Footer'
import { SiteNotices } from './SiteNotices'
import { Sidebar, SidebarOptions } from './Sidebar'
import { Breadcrumbs, Crumb } from './Breadcrumbs'
import { LiveScoresProvider } from '@/lib/live-scores'
import { matchesAroundNow } from '@/lib/utils'

/**
 * Shared chrome for every page: header, live bar, a wide two-column body
 * (content + sidebar on large screens, stacked on mobile) and the footer.
 * Nothing here reads cookies, so pages stay cacheable; the favourite club is
 * picked up in the browser.
 */
export function PageShell({
  data,
  sidebar = true,
  sidebarOptions,
  breadcrumbs,
  children,
}: {
  data: EredivisieData
  sidebar?: boolean
  sidebarOptions?: SidebarOptions
  breadcrumbs?: Crumb[]
  children: ReactNode
}) {
  const nearby = matchesAroundNow(data.allMatches)
  // The browser polls live scores around these kickoffs
  const kickoffs = nearby.map((m) => m.date)

  return (
    <LiveScoresProvider kickoffs={kickoffs}>
    <FavoriteClubProvider clubs={data.clubs}>
      <Header clubs={data.clubs} />
      <LiveBar matches={nearby} />
      <div
        className={`mx-auto w-full max-w-7xl flex-1 px-4 sm:px-5 ${
          sidebar ? 'lg:grid lg:grid-cols-[minmax(0,1fr)_20rem] lg:gap-8' : ''
        }`}
      >
        <main className="min-w-0">
          {breadcrumbs && <Breadcrumbs items={breadcrumbs} />}
          {children}
          <SiteNotices />
        </main>
        {sidebar && <Sidebar data={data} options={sidebarOptions} />}
      </div>
      <Footer clubs={data.clubs} />
    </FavoriteClubProvider>
    </LiveScoresProvider>
  )
}
