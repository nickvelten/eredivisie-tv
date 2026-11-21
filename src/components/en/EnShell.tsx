import Image from 'next/image'
import Link from 'next/link'
import { ReactNode } from 'react'
import { EN_NAV } from '@/lib/i18n'

/** Chrome for the English edition: a lean header, English footer, no betting and no Dutch-only widgets. */
export function EnShell({ nlHref, active, children }: { nlHref: string; active?: string; children: ReactNode }) {
  return (
    <div lang="en" className="flex min-h-full flex-1 flex-col">
      <header className="sticky top-0 z-50 border-b border-border bg-card/90 shadow-sm backdrop-blur-md">
        <div className="mx-auto flex max-w-5xl items-center justify-between gap-3 px-4 py-2.5 sm:px-5 sm:py-3.5">
          <Link href="/en" className="flex shrink-0 items-center gap-2.5" aria-label="Eredivisie.tv, English home">
            <Image src="/eredivisie-logo.svg" alt="" width={40} height={40} loading="eager" className="h-8 w-8 dark:brightness-0 dark:invert sm:h-10 sm:w-10" />
            <span className="whitespace-nowrap text-lg font-extrabold tracking-tight text-foreground sm:text-2xl">
              eredivisie<span className="text-accent">.tv</span>
            </span>
          </Link>
          <Link href={nlHref} hrefLang="nl" className="rounded-full px-3 py-1.5 text-sm font-semibold text-muted ring-1 ring-border hover:text-accent">
            Nederlands
          </Link>
        </div>
        <nav aria-label="Main" className="mx-auto flex max-w-5xl gap-1 overflow-x-auto px-3 pb-2 sm:px-4">
          {EN_NAV.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              aria-current={item.href === active ? 'page' : undefined}
              className={`whitespace-nowrap rounded-full px-3 py-1.5 text-sm font-semibold ${item.href === active ? 'bg-accent text-white' : 'text-muted hover:text-accent'}`}
            >
              {item.label}
            </Link>
          ))}
        </nav>
      </header>
      <main className="mx-auto w-full max-w-5xl flex-1 px-4 pb-12 sm:px-5">{children}</main>
      <footer className="border-t border-border py-8 text-center text-sm text-muted">
        <p>
          <strong className="text-foreground">eredivisie.tv</strong> · Independent guide to the Dutch Eredivisie. Not affiliated with the Eredivisie or ESPN.
        </p>
        <p className="mt-2">
          All times are Amsterdam time (CET/CEST). <Link href={nlHref} hrefLang="nl" className="underline hover:text-foreground">Nederlandse versie</Link> ·{' '}
          <Link href="/privacy" className="underline hover:text-foreground">Privacy (Dutch)</Link>
        </p>
      </footer>
    </div>
  )
}
