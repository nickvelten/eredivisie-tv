// src/app/page.tsx
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
          <hr className="border-white/5" />
        </div>
        <MatchSchedule />
        <div className="mx-auto max-w-5xl px-4">
          <hr className="border-white/5" />
        </div>
        <Standings />
        <div className="mx-auto max-w-5xl px-4">
          <hr className="border-white/5" />
        </div>
        <Providers />
      </main>
      <footer className="border-t border-white/5 py-6 text-center text-xs text-zinc-500">
        eredivisie.tv — Niet officieel gelieerd aan de Eredivisie
      </footer>
    </>
  )
}
