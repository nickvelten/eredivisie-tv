import Image from 'next/image'
import { providers } from '@/data/providers'

export function Providers() {
  return (
    <section id="providers" className="mx-auto w-full max-w-5xl px-4 py-10">
      <h2 className="mb-2 text-2xl font-extrabold text-foreground">Waar kijk je de Eredivisie?</h2>
      <p className="mb-8 text-sm text-muted">
        ESPN is de officiële uitzender van de Eredivisie. Je kunt ESPN ontvangen via verschillende providers.
      </p>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {providers.map((provider) => (
          <a
            key={provider.name}
            href={provider.url}
            target="_blank"
            rel="noopener noreferrer"
            className="group flex flex-col justify-between rounded-xl bg-card p-5 shadow-sm ring-1 ring-border transition-all hover:shadow-md hover:ring-accent/20"
          >
            <div>
              <div className="mb-3 flex items-center gap-3">
                <Image src={provider.logo} alt={provider.name} width={80} height={27} className="h-7 w-auto rounded" />
                <h3 className="text-base font-bold text-foreground">{provider.name}</h3>
              </div>
              <p className="text-sm text-muted">{provider.description}</p>
              <div className="mt-3 flex flex-wrap gap-1.5">
                {provider.channels.map((ch) => (
                  <span key={ch} className="rounded-full bg-background px-2.5 py-0.5 text-[11px] font-medium text-muted">{ch}</span>
                ))}
              </div>
            </div>
            <div className="mt-5 flex items-center justify-between border-t border-border pt-4">
              <span className="text-xl font-extrabold text-accent">{provider.price}</span>
              <span className="rounded-full bg-accent px-3 py-1 text-xs font-bold text-white opacity-0 transition-opacity group-hover:opacity-100">Bekijk →</span>
            </div>
          </a>
        ))}
      </div>
    </section>
  )
}
