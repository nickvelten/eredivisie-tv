// src/app/page.tsx
import Image from 'next/image'
import { Header } from '@/components/Header'
import { TodayHighlight } from '@/components/TodayHighlight'
import { MatchSchedule } from '@/components/MatchSchedule'
import { Standings } from '@/components/Standings'
import { Providers } from '@/components/Providers'

export default function Home() {
  return (
    <>
      <Header />
      <main className="flex-1">
        <TodayHighlight />
        <div className="mx-auto max-w-5xl px-4">
          <hr className="border-border" />
        </div>
        <MatchSchedule />
        <div className="mx-auto max-w-5xl px-4">
          <hr className="border-border" />
        </div>
        <Standings />
        <div className="mx-auto max-w-5xl px-4">
          <hr className="border-border" />
        </div>
        <Providers />
      </main>
      <footer className="border-t border-border py-8 text-center">
        <p className="text-xs text-muted mb-3">
          Let op: deze site toont momenteel voorbeelddata. De site is nog in ontwikkeling.
        </p>
        <p className="text-xs text-muted mb-4">
          eredivisie.tv — Niet officieel gelieerd aan de Eredivisie
        </p>
        <div className="flex items-center justify-center gap-2 text-xs text-muted-light">
          <span>Een project van</span>
          <a href="https://www.brandfirm.nl" target="_blank" rel="noopener noreferrer" className="transition-opacity hover:opacity-70">
            <Image src="https://www.brandfirm.nl/svg/logo.svg" alt="Brandfirm" width={100} height={24} />
          </a>
        </div>
      </footer>
    </>
  )
}
