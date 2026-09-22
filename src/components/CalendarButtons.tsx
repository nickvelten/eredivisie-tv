import { SITE_URL } from '@/lib/structured-data'

function CalendarIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="h-4 w-4" aria-hidden="true">
      <path fillRule="evenodd" d="M5.75 2a.75.75 0 01.75.75V4h7V2.75a.75.75 0 011.5 0V4h.25A2.75 2.75 0 0118 6.75v8.5A2.75 2.75 0 0115.25 18H4.75A2.75 2.75 0 012 15.25v-8.5A2.75 2.75 0 014.75 4H5V2.75A.75.75 0 015.75 2zm-1 5.5c-.69 0-1.25.56-1.25 1.25v6.5c0 .69.56 1.25 1.25 1.25h10.5c.69 0 1.25-.56 1.25-1.25v-6.5c0-.69-.56-1.25-1.25-1.25H4.75z" clipRule="evenodd" />
    </svg>
  )
}

const buttonClass =
  'inline-flex items-center gap-2 rounded-full bg-card px-4 py-2 text-sm font-semibold text-foreground shadow-sm ring-1 ring-border transition-all hover:shadow-md hover:text-accent hover:ring-accent/40'

export function MatchCalendarButton({ matchId }: { matchId: string }) {
  return (
    <a href={`/api/ics/wedstrijd/${matchId}`} download className={buttonClass}>
      <CalendarIcon /> Zet in agenda
    </a>
  )
}

export function ClubCalendarButton({ slug, clubName, onHero = false }: { slug: string; clubName: string; onHero?: boolean }) {
  // webcal:// opens the feed as a subscription in Apple/Outlook; Google Calendar users paste the https URL
  const feed = `${SITE_URL}/api/ics/club/${slug}`
  const cls = onHero
    ? 'inline-flex items-center gap-2 rounded-full bg-white/15 px-4 py-2 text-sm font-semibold text-inherit ring-1 ring-white/40 backdrop-blur-sm transition-all hover:bg-white/25'
    : buttonClass
  return (
    <a href={feed.replace(/^https:/, 'webcal:')} className={cls} title={`Abonneer op alle wedstrijden van ${clubName}`}>
      <CalendarIcon /> Agenda-abonnement
    </a>
  )
}
