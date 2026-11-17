export const CONTACT_EMAIL = 'hey@nickvelten.nl'

export const FEEDBACK_MAILTO = `mailto:${CONTACT_EMAIL}?subject=${encodeURIComponent('Idee voor eredivisie.tv')}&body=${encodeURIComponent(
  'Hoi Nick,\n\nIk heb een suggestie voor eredivisie.tv:\n\n'
)}`

export const FOR_SALE_MAILTO = `mailto:${CONTACT_EMAIL}?subject=${encodeURIComponent('Interesse in eredivisie.tv')}&body=${encodeURIComponent(
  'Hoi Nick,\n\nIk heb interesse in het overnemen van eredivisie.tv.\n\n'
)}`

function LightbulbIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="h-5 w-5" aria-hidden="true">
      <path d="M10 1a6 6 0 00-3.815 10.631C7.237 12.5 8 13.443 8 14.456v.644a.75.75 0 00.572.729 6.016 6.016 0 002.856 0A.75.75 0 0012 15.1v-.644c0-1.013.762-1.957 1.815-2.825A6 6 0 0010 1zM8.863 17.414a.75.75 0 00-.226 1.483 9.066 9.066 0 002.726 0 .75.75 0 00-.226-1.483 7.553 7.553 0 01-2.274 0z" />
    </svg>
  )
}

function TagIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="h-5 w-5" aria-hidden="true">
      <path fillRule="evenodd" d="M5.5 3A2.5 2.5 0 003 5.5v2.879a2.5 2.5 0 00.732 1.767l6.5 6.5a2.5 2.5 0 003.536 0l2.878-2.878a2.5 2.5 0 000-3.536l-6.5-6.5A2.5 2.5 0 008.38 3H5.5zM6 7a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
    </svg>
  )
}

/** Two notices above the footer: the site is for sale, and ideas are welcome. */
export function SiteNotices() {
  return (
    <section id="contact" className="w-full pb-12 pt-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="flex flex-col rounded-2xl bg-card p-6 shadow-sm ring-1 ring-border">
          <span className="mb-3 inline-flex h-10 w-10 items-center justify-center rounded-xl bg-accent-light text-accent">
            <TagIcon />
          </span>
          <h2 className="text-lg font-extrabold text-foreground">Deze website is te koop</h2>
          <p className="mt-1 flex-1 text-sm text-muted">
            eredivisie.tv is een sterke domeinnaam met een werkende site erop: live data van ESPN, club- en
            wedstrijdpagina&apos;s, agenda-feeds en SEO op orde. Interesse in overname? Stuur een bericht.
          </p>
          <a
            href={FOR_SALE_MAILTO}
            className="mt-4 inline-flex w-fit items-center gap-2 rounded-full bg-accent px-4 py-2 text-sm font-bold text-white shadow-sm transition-all hover:bg-accent/90 hover:shadow-md"
          >
            Ik heb interesse →
          </a>
        </div>
        <div className="flex flex-col rounded-2xl bg-card p-6 shadow-sm ring-1 ring-border">
          <span className="mb-3 inline-flex h-10 w-10 items-center justify-center rounded-xl bg-amber-400/15 text-amber-600 dark:text-amber-400">
            <LightbulbIcon />
          </span>
          <h2 className="text-lg font-extrabold text-foreground">Suggestie of idee?</h2>
          <p className="mt-1 flex-1 text-sm text-muted">
            Mis je iets, klopt er iets niet, of heb je een goed idee voor de site? Alle input is welkom en
            wordt gelezen.
          </p>
          <a
            href={FEEDBACK_MAILTO}
            className="mt-4 inline-flex w-fit items-center gap-2 rounded-full bg-card px-4 py-2 text-sm font-bold text-foreground shadow-sm ring-1 ring-border transition-all hover:text-accent hover:ring-accent/40"
          >
            Stuur je idee →
          </a>
        </div>
      </div>
    </section>
  )
}

/** Compact "Idee?" button for the header. */
export function FeedbackButton() {
  return (
    <a
      href={FEEDBACK_MAILTO}
      title="Suggestie of idee? Mail naar hey@nickvelten.nl"
      className="inline-flex items-center gap-1.5 rounded-lg px-2.5 py-2 text-sm font-medium text-muted transition-colors hover:bg-accent-light hover:text-accent"
    >
      <LightbulbIcon />
      <span className="hidden sm:inline">Idee?</span>
    </a>
  )
}
