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
      <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-4 sm:px-5 sm:py-5">
        <a href="#" className="flex items-center gap-3">
          <Image
            src="/eredivisie-logo.svg"
            alt="Eredivisie"
            width={52}
            height={52}
            className="h-10 w-10 sm:h-13 sm:w-13"
          />
          <span className="text-xl font-extrabold tracking-tight text-foreground sm:text-2xl">
            eredivisie<span className="text-accent">.tv</span>
          </span>
        </a>
        <div className="flex items-center gap-4 sm:gap-6">
          <nav className="hidden gap-1 sm:flex">
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
          <a
            href="https://www.brandfirm.nl"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 rounded-full bg-background px-3 py-1.5 text-[10px] font-medium text-muted-light transition-opacity hover:opacity-70 sm:text-xs"
          >
            <span className="hidden sm:inline">Partner:</span>
            <Image src="https://www.brandfirm.nl/svg/logo.svg" alt="Brandfirm" width={72} height={18} className="h-3.5 w-auto sm:h-4" />
          </a>
        </div>
      </div>
      {/* Mobile nav */}
      <nav className="flex border-t border-black/5 sm:hidden">
        {navItems.map((item) => (
          <a
            key={item.href}
            href={item.href}
            className="flex-1 py-2.5 text-center text-xs font-medium text-muted transition-colors hover:text-accent"
          >
            {item.label}
          </a>
        ))}
      </nav>
    </header>
  )
}
