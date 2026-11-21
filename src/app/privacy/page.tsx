import type { Metadata } from 'next'
import { PageShell } from '@/components/PageShell'
import { CONTACT_EMAIL } from '@/components/SiteNotices'
import { fetchEredivisieData } from '@/lib/espn'
import { SITE_URL } from '@/lib/structured-data'

export const metadata: Metadata = {
  title: 'Privacy en cookies | Eredivisie.tv',
  description: 'Welke gegevens Eredivisie.tv gebruikt, waarom, en hoe je je keuze voor cookies aanpast.',
  alternates: { canonical: `${SITE_URL}/privacy` },
  robots: { index: false, follow: true },
}

const SECTIONS: { title: string; body: string[] }[] = [
  {
    title: 'Wie zijn we',
    body: [
      `Eredivisie.tv is een onafhankelijke site van Nick Velten en is niet gelieerd aan de Eredivisie of ESPN. Vragen over privacy: ${CONTACT_EMAIL}.`,
    ],
  },
  {
    title: 'Wat we op je apparaat bewaren',
    body: [
      'Je favoriete club (cookie "favoriteClub" en localStorage) en je keuze voor licht of donker thema. Die blijven op je eigen apparaat en sturen we nergens heen. Ze zijn nodig om de site te laten werken zoals je hem hebt ingesteld, dus daar vragen we geen toestemming voor.',
      'Je cookiekeuze zelf bewaren we ook in localStorage.',
    ],
  },
  {
    title: 'Statistieken (alleen met toestemming)',
    body: [
      'Met je toestemming gebruiken we Google Analytics 4 om te zien hoeveel mensen de site bezoeken en welke pagina\'s nuttig zijn. Zonder toestemming plaatst Google Analytics geen cookies (Google Consent Mode). We gebruiken de gegevens niet voor advertenties en delen ze niet met anderen.',
      'Je kunt je keuze altijd aanpassen via "Cookie-instellingen" onderaan elke pagina.',
    ],
  },
  {
    title: 'Meldingen',
    body: [
      'Zet je meldingen aan voor je club, dan bewaren we het technische adres dat je browser daarvoor aanmaakt, samen met de club die je volgt. Daar zit geen naam of e-mailadres bij. Zet je de meldingen uit, dan verwijderen we dat adres.',
    ],
  },
  {
    title: 'Links naar andere sites',
    body: [
      'We linken naar tv-providers, ESPN en (gemarkeerd als gesponsord) naar Unibet. Op die sites gelden hun eigen privacyregels. Odds tonen we alleen voor bezoekers vanaf 18 jaar.',
    ],
  },
  {
    title: 'Je rechten',
    body: [
      `Je kunt vragen welke gegevens we van je hebben, ze laten verwijderen of bezwaar maken. Mail naar ${CONTACT_EMAIL}. Ben je het niet eens met hoe we met je gegevens omgaan, dan kun je een klacht indienen bij de Autoriteit Persoonsgegevens.`,
    ],
  },
]

export default async function PrivacyPage() {
  const data = await fetchEredivisieData()
  return (
    <PageShell data={data} breadcrumbs={[{ label: 'Privacy', href: '/privacy' }]}>
      <h1 className="pt-6 text-3xl font-extrabold tracking-tight text-foreground">Privacy en cookies</h1>
      <p className="mt-2 text-sm text-muted">Laatst bijgewerkt: november 2026</p>
      <div className="max-w-2xl space-y-6 py-8">
        {SECTIONS.map((s) => (
          <section key={s.title}>
            <h2 className="text-lg font-extrabold text-foreground">{s.title}</h2>
            {s.body.map((p) => (
              <p key={p} className="mt-2 text-sm leading-relaxed text-muted">{p}</p>
            ))}
          </section>
        ))}
      </div>
    </PageShell>
  )
}
