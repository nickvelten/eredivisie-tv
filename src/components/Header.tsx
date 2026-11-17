import Image from 'next/image'
import Link from 'next/link'
import { Club } from '@/data/types'
import { ThemeToggle } from './ThemeToggle'
import { ClubMenu } from './ClubMenu'
import { NavLinks, NavItem } from './NavLinks'
import { FavoriteClubLink } from './FavoriteClubLink'
import { HeaderOffset } from './HeaderOffset'
import { FeedbackButton } from './SiteNotices'
import { SearchBox } from './SearchBox'

export const NAV_ITEMS: NavItem[] = [
  { label: 'Overzicht', href: '/' },
  { label: 'Op TV vandaag', href: '/eredivisie-op-tv-vandaag' },
  { label: 'Programma', href: '/programma' },
  { label: 'Uitslagen', href: '/uitslagen' },
  { label: 'Stand', href: '/stand' },
  { label: 'Topscorers', href: '/topscorers' },
  { label: 'Statistieken', href: '/statistieken' },
  { label: 'Clubs', href: '/clubs' },
  { label: 'Eerste divisie', href: '/eerste-divisie' },
  { label: 'Beker', href: '/knvb-beker' },
]

/**
 * Two-row header: brand and utilities (search, club picker, ideas, theme) on
 * top, page navigation below.
 */
export function Header({ clubs = [] }: { clubs?: Club[] }) {
  return (
    <header className="sticky top-0 z-50 border-b border-border bg-card/90 shadow-sm backdrop-blur-md">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-3 px-4 py-2.5 sm:px-5 sm:py-3.5">
        <Link href="/" className="flex shrink-0 items-center gap-2.5 sm:gap-3" aria-label="Eredivisie.tv, naar de homepage">
          <Image
            src="/eredivisie-logo.svg"
            alt=""
            width={52}
            height={52}
            loading="eager"
            className="h-8 w-8 shrink-0 dark:brightness-0 dark:invert sm:h-11 sm:w-11"
          />
          <span className="whitespace-nowrap text-lg font-extrabold tracking-tight text-foreground sm:text-2xl">
            eredivisie<span className="text-accent">.tv</span>
          </span>
        </Link>
        <div className="flex min-w-0 items-center justify-end gap-0.5 sm:gap-1">
          <SearchBox />
          <ClubMenu clubs={clubs} />
          <FeedbackButton />
          <ThemeToggle />
        </div>
      </div>
      <div className="border-t border-border">
        <div className="mx-auto flex max-w-7xl items-center gap-1 px-2 sm:px-3">
          <FavoriteClubLink />
          <NavLinks items={NAV_ITEMS} />
        </div>
      </div>
      <HeaderOffset />
    </header>
  )
}
