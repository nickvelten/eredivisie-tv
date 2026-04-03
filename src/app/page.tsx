import { Header } from '@/components/Header'
import { TodayHighlight } from '@/components/TodayHighlight'
import { MatchSchedule } from '@/components/MatchSchedule'
import { Standings } from '@/components/Standings'
import { Providers } from '@/components/Providers'

export default function Home() {
  return (
    <>
      <Header />
      <div className="mx-auto max-w-5xl px-4 py-3">
        <div className="rounded-lg bg-amber-50 px-4 py-2.5 text-center text-xs font-medium text-amber-700 ring-1 ring-amber-200">
          Deze site toont momenteel voorbeelddata — de site is nog in ontwikkeling.
        </div>
      </div>
      <main className="flex-1">
        <TodayHighlight />
        <MatchSchedule />
        <Standings />
        <Providers />
      </main>
      <footer className="border-t border-black/5 bg-white py-8">
        <div className="mx-auto max-w-5xl px-4 text-center">
          <p className="text-sm font-medium text-muted mb-1">eredivisie.tv</p>
          <p className="text-xs text-muted-light">Niet officieel gelieerd aan de Eredivisie</p>
        </div>
      </footer>
    </>
  )
}
