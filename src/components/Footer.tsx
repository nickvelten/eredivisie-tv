import Link from 'next/link'

export function Footer() {
  return (
    <footer className="border-t border-border bg-card py-10">
      <div className="mx-auto max-w-5xl px-4">
        <div className="flex flex-col items-center gap-6 text-center">
          <p className="text-base font-extrabold tracking-tight text-foreground">
            eredivisie<span className="text-accent">.tv</span>
          </p>
          <nav className="flex flex-wrap justify-center gap-x-6 gap-y-2 text-sm font-medium text-muted">
            <Link href="/#vandaag" className="transition-colors hover:text-foreground">Vandaag</Link>
            <Link href="/#programma" className="transition-colors hover:text-foreground">Programma</Link>
            <Link href="/#stand" className="transition-colors hover:text-foreground">Stand</Link>
            <Link href="/#topscorers" className="transition-colors hover:text-foreground">Topscorers</Link>
            <Link href="/#providers" className="transition-colors hover:text-foreground">Providers</Link>
          </nav>
          <div className="space-y-1.5 text-xs text-muted-light">
            <p>Niet officieel gelieerd aan de Eredivisie. Uitzendinformatie kan wijzigen; raadpleeg je provider.</p>
            <p>18+ | Wat kost gokken jou? Stop op tijd. <a href="https://www.loketkansspel.nl" target="_blank" rel="noopener noreferrer" className="underline transition-colors hover:text-foreground">loketkansspel.nl</a></p>
          </div>
        </div>
      </div>
    </footer>
  )
}
