// src/components/Providers.tsx
import { providers } from '@/data/providers'

export function Providers() {
  return (
    <section id="providers" className="mx-auto w-full max-w-5xl px-4 py-8">
      <h2 className="mb-2 text-xl font-bold text-foreground">Waar kijk je de Eredivisie?</h2>
      <p className="mb-6 text-sm text-muted">
        ESPN is de officiële uitzender van de Eredivisie. Je kunt ESPN ontvangen via verschillende providers.
      </p>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {providers.map((provider) => (
          <a
            key={provider.name}
            href={provider.url}
            target="_blank"
            rel="noopener noreferrer"
            className="flex flex-col justify-between rounded-xl bg-card p-5 transition-colors hover:bg-card-hover"
          >
            <div>
              <h3 className="text-base font-semibold text-foreground">{provider.name}</h3>
              <p className="mt-1 text-sm text-muted">{provider.description}</p>
              <div className="mt-3 flex flex-wrap gap-1.5">
                {provider.channels.map((ch) => (
                  <span key={ch} className="rounded bg-border px-2 py-0.5 text-xs text-foreground/80">{ch}</span>
                ))}
              </div>
            </div>
            <div className="mt-4 flex items-center justify-between">
              <span className="text-lg font-bold text-accent">{provider.price}</span>
              <span className="text-xs text-muted">Bekijk →</span>
            </div>
          </a>
        ))}
      </div>
    </section>
  )
}
