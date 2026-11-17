import { FaqItem, faqStructuredData } from '@/lib/structured-data'

/** Visible FAQ (native disclosure, no JS) plus FAQPage structured data. */
export function Faq({ title, items }: { title: string; items: FaqItem[] }) {
  if (items.length === 0) return null
  return (
    <section className="w-full py-8">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqStructuredData(items)) }} />
      <h2 className="mb-4 text-2xl font-extrabold text-foreground">{title}</h2>
      <div className="divide-y divide-border rounded-xl bg-card shadow-sm ring-1 ring-border">
        {items.map((f) => (
          <details key={f.question} className="group px-5 py-4 [&_summary::-webkit-details-marker]:hidden">
            <summary className="flex cursor-pointer list-none items-center justify-between gap-4 text-sm font-semibold text-foreground">
              {f.question}
              <span aria-hidden="true" className="text-muted transition-transform group-open:rotate-45">+</span>
            </summary>
            <p className="mt-2 text-sm leading-relaxed text-muted">{f.answer}</p>
          </details>
        ))}
      </div>
    </section>
  )
}
