import Image from 'next/image'
import Link from 'next/link'
import { Club } from '@/data/types'
import { CONTACT_EMAIL } from './SiteNotices'
import { NAV_ITEMS } from './Header'
import { ConsentSettingsButton } from './ConsentBanner'

export function Footer({ clubs = [] }: { clubs?: Club[] }) {
  return (
    <footer className="border-t border-border bg-card py-10">
      <div className="mx-auto max-w-7xl px-4 sm:px-5">
        {clubs.length > 0 && (
          <nav aria-label="Clubs" className="mb-10">
            <p className="mb-4 text-xs font-bold uppercase tracking-widest text-muted">Eredivisie-clubs op TV</p>
            <ul className="grid grid-cols-2 gap-x-4 gap-y-2 sm:grid-cols-3 lg:grid-cols-6">
              {clubs.map((club) => (
                <li key={club.id}>
                  <Link href={`/club/${club.slug}`} className="flex items-center gap-2 text-sm text-muted transition-colors hover:text-accent">
                    <Image src={club.logo} alt="" width={16} height={16} className="h-4 w-4 shrink-0" />
                    <span className="truncate">{club.name}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        )}
        <div className="flex flex-col items-center gap-6 border-t border-border pt-8 text-center">
          <p className="text-base font-extrabold tracking-tight text-foreground">
            eredivisie<span className="text-accent">.tv</span>
          </p>
          <nav aria-label="Footer" className="flex flex-wrap justify-center gap-x-6 gap-y-2 text-sm font-medium text-muted">
            {NAV_ITEMS.filter((item) => item.href !== '/').map((item) => (
              <Link key={item.href} href={item.href} className="transition-colors hover:text-foreground">{item.label}</Link>
            ))}
            <Link href="/eredivisie-dit-weekend" className="transition-colors hover:text-foreground">Dit weekend</Link>
            <Link href="/restprogramma" className="transition-colors hover:text-foreground">Restprogramma</Link>
            <Link href="/standcalculator" className="transition-colors hover:text-foreground">Standcalculator</Link>
            <Link href="/gids" className="transition-colors hover:text-foreground">Eredivisie kijken</Link>
            <Link href="/zender/espn-1" className="transition-colors hover:text-foreground">Zenders</Link>
            <Link href="/widget-insluiten" className="transition-colors hover:text-foreground">Widget</Link>
            <Link href="/vergelijk" className="transition-colors hover:text-foreground">Vergelijken</Link>
            <Link href="/en" hrefLang="en" className="transition-colors hover:text-foreground">English</Link>
            <Link href="/te-koop" className="transition-colors hover:text-foreground">Website te koop</Link>
          </nav>
          <div className="space-y-1.5 text-xs text-muted-light">
            <p>Niet officieel gelieerd aan de Eredivisie. Uitzendinformatie kan wijzigen; raadpleeg je provider.</p>
            <p>Vragen, ideeën of interesse in overname: <a href={`mailto:${CONTACT_EMAIL}`} className="underline transition-colors hover:text-foreground">{CONTACT_EMAIL}</a></p>
            <p>
              <Link href="/privacy" className="underline transition-colors hover:text-foreground">Privacy</Link>
              {process.env.NEXT_PUBLIC_GA_ID && (
                <>
                  {' · '}
                  <ConsentSettingsButton />
                </>
              )}
            </p>
            <p>18+ | Wat kost gokken jou? Stop op tijd. <a href="https://www.loketkansspel.nl" target="_blank" rel="noopener noreferrer" className="underline transition-colors hover:text-foreground">loketkansspel.nl</a></p>
          </div>
        </div>
      </div>
    </footer>
  )
}
