import Link from 'next/link'
import { SITE_URL } from '@/lib/structured-data'

export type Crumb = { label: string; href: string }

/** Visible breadcrumb trail plus BreadcrumbList structured data. "Home" is added automatically. */
export function Breadcrumbs({ items }: { items: Crumb[] }) {
  const all: Crumb[] = [{ label: 'Home', href: '/' }, ...items]
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: all.map((c, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: c.label,
      item: `${SITE_URL}${c.href === '/' ? '' : c.href}`,
    })),
  }

  return (
    <nav aria-label="Kruimelpad" className="pt-5 text-xs text-muted">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <ol className="flex flex-wrap items-center gap-1.5">
        {all.map((c, i) => (
          <li key={c.href} className="flex items-center gap-1.5">
            {i > 0 && <span aria-hidden="true" className="text-muted-light">/</span>}
            {i === all.length - 1 ? (
              <span aria-current="page" className="font-semibold text-foreground">{c.label}</span>
            ) : (
              <Link href={c.href} className="hover:text-accent">{c.label}</Link>
            )}
          </li>
        ))}
      </ol>
    </nav>
  )
}
