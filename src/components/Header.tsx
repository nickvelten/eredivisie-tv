import Image from 'next/image'
import { ThemeToggle } from './ThemeToggle'

const navItems = [
  { label: 'Vandaag', href: '#vandaag' },
  { label: 'Programma', href: '#programma' },
  { label: 'Stand', href: '#stand' },
  { label: 'Providers', href: '#providers' },
]

export function Header() {
  return (
    <header className="sticky top-0 z-50 border-b border-border bg-background/95 backdrop-blur-sm">
      <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-3">
        <a href="#" className="flex items-center gap-3">
          <Image
            src="/eredivisie-logo.svg"
            alt="Eredivisie"
            width={32}
            height={32}
          />
          <span className="text-lg font-bold text-foreground">
            eredivisie<span className="text-accent">.tv</span>
          </span>
        </a>
        <div className="flex items-center gap-6">
          <nav className="flex gap-6">
            {navItems.map((item) => (
              <a
                key={item.href}
                href={item.href}
                className="text-sm text-muted transition-colors hover:text-foreground"
              >
                {item.label}
              </a>
            ))}
          </nav>
          <ThemeToggle />
        </div>
      </div>
    </header>
  )
}
