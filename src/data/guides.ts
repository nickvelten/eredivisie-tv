import { FaqItem } from '@/lib/structured-data'
import { PRICES_CHECKED } from './providers'

export type GuideSection = { heading: string; paragraphs: string[] }

export type Guide = {
  slug: string
  title: string
  h1: string
  description: string
  intro: string
  sections: GuideSection[]
  faq: FaqItem[]
  /** Show the provider comparison table */
  providerTable?: boolean
}

export const GUIDES: Guide[] = [
  {
    slug: 'eredivisie-kijken-zonder-ziggo',
    title: 'Eredivisie kijken zonder Ziggo: alle opties en prijzen | Eredivisie.tv',
    h1: 'Eredivisie kijken zonder Ziggo',
    description: `Geen Ziggo? Zo kijk je de Eredivisie via KPN, Odido of Canal Digitaal, met prijzen (gecheckt ${PRICES_CHECKED}) en de dagpas voor één wedstrijd.`,
    intro: 'ESPN heeft de rechten op alle Eredivisie-wedstrijden. Bij Ziggo zit ESPN in elk tv-pakket, maar ook zonder Ziggo kun je alles zien.',
    sections: [
      {
        heading: 'Je hebt altijd een tv-provider nodig',
        paragraphs: [
          'ESPN verkoopt in Nederland geen los abonnement. Je neemt ESPN af als extra pakket bij je tv-provider, en kijkt daarna ook online in de ESPN Watch-app of de app van je provider.',
        ],
      },
      {
        heading: 'KPN',
        paragraphs: ['Bij KPN TV+ neem je ESPN Compleet voor €14,99 per maand. Kies je het als Combivoordeel bij internet en mobiel, dan zit het er gratis bij.'],
      },
      {
        heading: 'Odido',
        paragraphs: [
          'Odido biedt ESPN Compleet voor €12,50 per maand, maandelijks opzegbaar en inclusief ESPN Watch. Wil je maar één wedstrijd zien? Dan is er een dagpas van €6.',
        ],
      },
      {
        heading: 'Canal Digitaal',
        paragraphs: ['Kijk je via de schotel, dan kost ESPN Compleet €14,95 per maand. ESPN 3 zie je daar alleen in de app; onderweg kijk je via de CANAL+ app.'],
      },
      {
        heading: 'Wat is het voordeligst?',
        paragraphs: [
          'Voor af en toe een wedstrijd is de dagpas van Odido het goedkoopst. Kijk je elke week, dan is een maandabonnement voordeliger. Heb je KPN voor internet en mobiel, kijk dan eerst of ESPN als Combivoordeel kan.',
        ],
      },
    ],
    faq: [
      { question: 'Kan ik de Eredivisie kijken zonder Ziggo?', answer: 'Ja. Via KPN, Odido en Canal Digitaal neem je ESPN Compleet af, met alle Eredivisie-wedstrijden.' },
      { question: 'Bestaat er een los ESPN-abonnement?', answer: 'Nee. In Nederland kijk je ESPN altijd via een tv-provider. Online kijk je daarna in de ESPN Watch-app of de app van je provider.' },
      { question: 'Kan ik één Eredivisie-wedstrijd kijken?', answer: 'Ja, Odido verkoopt een dagpas voor ESPN van €6.' },
    ],
    providerTable: true,
  },
  {
    slug: 'espn-abonnement-vergelijken',
    title: `ESPN-abonnement vergelijken: prijzen per provider (${PRICES_CHECKED}) | Eredivisie.tv`,
    h1: 'ESPN-abonnement vergelijken',
    description: `Wat kost ESPN bij Ziggo, KPN, Odido en Canal Digitaal? Alle prijzen voor de Eredivisie op een rij, gecheckt in ${PRICES_CHECKED}.`,
    intro: 'Alle Eredivisie-wedstrijden zijn live op ESPN. Wat je betaalt, hangt af van je tv-provider. Hieronder de prijzen op een rij.',
    sections: [
      {
        heading: 'Ziggo: ESPN zit in elk pakket',
        paragraphs: [
          'Sinds juli 2026 zitten ESPN 1 tot en met 4 in elk digitaal tv-pakket van Ziggo. Met ESPN Premium (€9,95 per maand) krijg je er Ziggo GO, Ultra HD en ESPN Watch bij.',
        ],
      },
      {
        heading: 'KPN, Odido en Canal Digitaal: ESPN Compleet',
        paragraphs: [
          'Bij de andere providers heet het pakket ESPN Compleet: €14,99 bij KPN (gratis als Combivoordeel), €12,50 bij Odido (maandelijks opzegbaar, dagpas €6) en €14,95 bij Canal Digitaal.',
        ],
      },
      {
        heading: 'Online kijken',
        paragraphs: ['Met een ESPN-abonnement via je provider kijk je ook in de ESPN Watch-app op telefoon, tablet en smart-tv. De meeste providers hebben daarnaast een eigen app.'],
      },
    ],
    faq: [
      { question: 'Wat kost ESPN per maand?', answer: 'Bij Ziggo zit ESPN in elk tv-pakket. ESPN Compleet kost €14,99 bij KPN, €12,50 bij Odido en €14,95 bij Canal Digitaal.' },
      { question: 'Waar is ESPN het goedkoopst?', answer: 'Heb je Ziggo, dan betaal je niets extra. Anders is Odido met €12,50 per maand het goedkoopst, of KPN als je het als Combivoordeel kiest.' },
    ],
    providerTable: true,
  },
  {
    slug: 'eredivisie-kijken-in-het-buitenland',
    title: 'Eredivisie kijken in het buitenland: zo werkt het | Eredivisie.tv',
    h1: 'Eredivisie kijken in het buitenland',
    description: 'Op vakantie of tijdelijk in het buitenland? Zo kijk je de Eredivisie met je Nederlandse ESPN-abonnement binnen de EU, en waar je buiten de EU op moet letten.',
    intro: 'Met een Nederlands ESPN-abonnement kun je binnen de EU gewoon de Eredivisie blijven kijken. Daarbuiten ligt het anders.',
    sections: [
      {
        heading: 'Binnen de EU: je abonnement gaat mee',
        paragraphs: [
          'Door de Europese portabiliteitsverordening mag je online diensten waar je in Nederland voor betaalt, ook gebruiken als je tijdelijk in een ander EU-land bent. Dat geldt voor de ESPN Watch-app en de apps van je provider.',
          'Log voor vertrek in de app in en controleer of je account werkt. De provider mag af en toe controleren of je nog in Nederland woont.',
        ],
      },
      {
        heading: 'Buiten de EU',
        paragraphs: [
          'Buiten de EU geldt die regel niet. Apps blokkeren dan vaak de stream. Of en waar de Eredivisie te zien is, hangt af van de lokale tv-rechten in dat land.',
        ],
      },
      {
        heading: 'Aftraptijden',
        paragraphs: ['Alle tijden op Eredivisie.tv zijn Nederlandse tijd. Reken in het buitenland het tijdsverschil mee.'],
      },
    ],
    faq: [
      { question: 'Kan ik ESPN kijken op vakantie in Spanje of Frankrijk?', answer: 'Ja. Binnen de EU kun je met je Nederlandse abonnement de ESPN Watch-app en de app van je provider gewoon gebruiken.' },
      { question: 'Werkt ESPN Watch buiten de EU?', answer: 'Meestal niet. Buiten de EU blokkeren de apps de stream vaak vanwege de tv-rechten.' },
    ],
  },
]

export function findGuide(slug: string): Guide | undefined {
  return GUIDES.find((g) => g.slug === slug)
}
