import Image from 'next/image'

const navItems = [
  { label: 'Vandaag', href: '#vandaag' },
  { label: 'Programma', href: '#programma' },
  { label: 'Stand', href: '#stand' },
  { label: 'Providers', href: '#providers' },
]

export function Header() {
  return (
    <header className="sticky top-0 z-50 border-b border-white/5 bg-[#0a0a0a]/95 backdrop-blur-sm">
      <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-3">
        <a href="#" className="flex items-center gap-3">
          <Image
            src="/eredivisie-logo.svg"
            alt="Eredivisie"
            width={32}
            height={32}
          />
          <span className="text-lg font-bold text-white">
            eredivisie<span className="text-[#e01e36]">.tv</span>
          </span>
        </a>
        <nav className="flex gap-6">
          {navItems.map((item) => (
            <a
              key={item.href}
              href={item.href}
              className="text-sm text-zinc-400 transition-colors hover:text-white"
            >
              {item.label}
            </a>
          ))}
        </nav>
      </div>
    </header>
  )
}
