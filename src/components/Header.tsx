import Image from 'next/image'

const navItems = [
  { label: 'Vandaag', href: '#vandaag' },
  { label: 'Programma', href: '#programma' },
  { label: 'Stand', href: '#stand' },
  { label: 'Providers', href: '#providers' },
]

export function Header() {
  return (
    <header className="sticky top-0 z-50 bg-white shadow-sm">
      <div className="mx-auto flex max-w-5xl items-center justify-between px-5 py-4">
        <a href="#" className="flex items-center gap-3">
          <Image
            src="/eredivisie-logo.svg"
            alt="Eredivisie"
            width={44}
            height={44}
          />
          <span className="text-2xl font-extrabold tracking-tight text-foreground">
            eredivisie<span className="text-accent">.tv</span>
          </span>
        </a>
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
      </div>
    </header>
  )
}
