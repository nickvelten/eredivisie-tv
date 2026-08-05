import Image from 'next/image'
import { ThemeToggle } from './ThemeToggle'

const navItems = [
  { label: 'Vandaag', href: '#vandaag' },
  { label: 'Mijn club', href: '#mijn-club' },
  { label: 'Programma', href: '#programma' },
  { label: 'Uitslagen', href: '#uitslagen' },
  { label: 'Stand', href: '#stand' },
  { label: 'Topscorers', href: '#topscorers' },
  { label: 'Providers', href: '#providers' },
]

export function Header() {
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
          <nav className="flex gap-1">
            {navItems.map((item) => (
              <a
                key={item.href}
                href={item.href}
                className="rounded-lg px-4 py-2.5 text-sm font-medium text-muted transition-colors hover:bg-accent-light hover:text-accent"
              >
                {item.label}
              </a>
            ))}
          </nav>
          <ThemeToggle />
        </div>
      </div>
      {/* Mobile nav */}
      <div className="flex items-center border-t border-border sm:hidden">
        <nav className="flex flex-1 gap-1 overflow-x-auto px-2 py-1.5">
          {navItems.map((item) => (
            <a
              key={item.href}
              href={item.href}
              className="shrink-0 whitespace-nowrap rounded-full px-3 py-1 text-xs font-medium text-muted transition-colors hover:bg-accent-light hover:text-accent"
            >
              {item.label}
            </a>
          ))}
        </nav>
        <div className="shrink-0 pr-1">
          <ThemeToggle />
        </div>
      </div>
    </header>
  )
}
