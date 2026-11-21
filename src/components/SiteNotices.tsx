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

/** Feedback prompt above the footer. The for-sale notice lives on /te-koop. */
export function SiteNotices() {
  return (
    <section id="contact" className="w-full pb-12 pt-4">
      <div className="flex flex-col gap-4 rounded-2xl bg-card p-5 shadow-sm ring-1 ring-border sm:flex-row sm:items-center">
        <span className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-amber-400/15 text-amber-600 dark:text-amber-400">
          <LightbulbIcon />
        </span>
        <div className="min-w-0 flex-1">
          <p className="text-base font-extrabold text-foreground">Suggestie of idee?</p>
          <p className="mt-0.5 text-sm text-muted">Mis je iets of klopt er iets niet? Alle input is welkom en wordt gelezen.</p>
        </div>
        <a
          href={FEEDBACK_MAILTO}
          className="inline-flex w-fit shrink-0 items-center gap-2 rounded-full bg-card px-4 py-2 text-sm font-bold text-foreground shadow-sm ring-1 ring-border transition-all hover:text-accent hover:ring-accent/40"
        >
          Stuur je idee →
        </a>
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
