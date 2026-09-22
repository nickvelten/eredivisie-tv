import Image from 'next/image'
import Link from 'next/link'
import { Club } from '@/data/types'
import { ThemeToggle } from './ThemeToggle'
import { ClubMenu } from './ClubMenu'
import { NavLinks, NavItem } from './NavLinks'
import { FavoriteClubLink } from './FavoriteClubLink'
import { HeaderOffset } from './HeaderOffset'

const sectionItems: NavItem[] = [
  { label: 'Vandaag', href: '#vandaag' },
  { label: 'Programma', href: '#programma' },
  { label: 'Uitslagen', href: '#uitslagen' },
  { label: 'Stand', href: '#stand' },
  { label: 'Topscorers', href: '#topscorers' },
  { label: 'Providers', href: '#providers' },
]

/**
 * Two-row header: the top row carries the brand and utilities (club picker,
 * theme), the second row is the section navigation. On subpages the second
 * row shows a back link instead of anchors.
 */
export function Header({ clubs = [], showSections = true }: { clubs?: Club[]; showSections?: boolean }) {
  return (
    <header className="sticky top-0 z-50 border-b border-border bg-card/90 shadow-sm backdrop-blur-md">
      <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-3 sm:px-5 sm:py-4">
        <Link href="/" className="flex items-center gap-3">
          <Image
            src="/eredivisie-logo.svg"
            alt="Eredivisie"
            width={52}
            height={52}
            className="h-9 w-9 dark:brightness-0 dark:invert sm:h-11 sm:w-11"
          />
          <span className="text-xl font-extrabold tracking-tight text-foreground sm:text-2xl">
            eredivisie<span className="text-accent">.tv</span>
          </span>
        </Link>
        <div className="flex items-center gap-1">
          <ClubMenu clubs={clubs} />
          <ThemeToggle />
        </div>
      </div>
      <div className="border-t border-border">
        <div className="mx-auto flex max-w-5xl items-center gap-1 px-2 sm:px-3">
          <FavoriteClubLink />
          {showSections ? (
            <NavLinks items={sectionItems} />
          ) : (
            <nav className="flex gap-1 px-1 py-1.5" aria-label="Secties">
              <Link
                href="/"
                className="rounded-lg px-3 py-1.5 text-sm font-medium text-muted transition-colors hover:bg-accent-light hover:text-accent"
              >
                ← Terug naar overzicht
              </Link>
            </nav>
          )}
        </div>
      </div>
      <HeaderOffset />
    </header>
  )
}
