import Image from 'next/image'
import { Club } from '@/data/types'
import { ThemeToggle } from './ThemeToggle'
import { ClubMenu } from './ClubMenu'
import { NavLinks, NavItem } from './NavLinks'

const navItems: NavItem[] = [
  { label: 'Vandaag', href: '#vandaag' },
  { label: 'Programma', href: '#programma' },
  { label: 'Uitslagen', href: '#uitslagen' },
  { label: 'Stand', href: '#stand' },
  { label: 'Topscorers', href: '#topscorers' },
  { label: 'Providers', href: '#providers' },
]

export function Header({ clubs = [] }: { clubs?: Club[] }) {
  return (
    <header className="sticky top-0 z-50 border-b border-border bg-card/90 shadow-sm backdrop-blur-md">
      <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-4 sm:px-5 sm:py-5">
        <a href="#" className="flex items-center gap-3">
          <Image
            src="/eredivisie-logo.svg"
            alt="Eredivisie"
            width={52}
            height={52}
            className="h-10 w-10 dark:brightness-0 dark:invert sm:h-13 sm:w-13"
          />
          <span className="text-xl font-extrabold tracking-tight text-foreground sm:text-2xl">
            eredivisie<span className="text-accent">.tv</span>
          </span>
        </a>
        <div className="hidden items-center gap-1 sm:flex">
          <NavLinks items={navItems} variant="desktop" />
          <ClubMenu clubs={clubs} />
          <ThemeToggle />
        </div>
      </div>
      {/* Mobile nav */}
      <div className="flex items-center border-t border-border sm:hidden">
        <NavLinks items={navItems} variant="mobile" />
        <div className="flex shrink-0 items-center pr-1">
          <ClubMenu clubs={clubs} />
          <ThemeToggle />
        </div>
      </div>
    </header>
  )
}
