import { ImageResponse } from 'next/og'

export const OG_SIZE = { width: 1200, height: 630 }

/**
 * Shared social card: brand row, big title, optional subtitle and up to two
 * logos, on a gradient in the given colour.
 */
export function ogCard({
  eyebrow,
  title,
  subtitle,
  logos = [],
  color = '#e01e36',
  colorTo = '#7a0f1d',
}: {
  eyebrow?: string
  title: string
  subtitle?: string
  logos?: string[]
  color?: string
  colorTo?: string
}) {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          padding: '64px 72px',
          background: `linear-gradient(135deg, ${color} 0%, ${colorTo} 100%)`,
          color: 'white',
          fontFamily: 'sans-serif',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', fontSize: 34, fontWeight: 800, letterSpacing: -1 }}>
          eredivisie<span style={{ opacity: 0.7 }}>.tv</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 48 }}>
          {logos.length > 0 && (
            <div style={{ display: 'flex', gap: 24 }}>
              {logos.map((src) => (
                <div
                  key={src}
                  style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: 180, height: 180, borderRadius: 999, background: 'white' }}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={src} width={130} height={130} alt="" style={{ objectFit: 'contain' }} />
                </div>
              ))}
            </div>
          )}
          <div style={{ display: 'flex', flexDirection: 'column', flex: 1 }}>
            {eyebrow && <div style={{ fontSize: 28, fontWeight: 700, opacity: 0.75, textTransform: 'uppercase', letterSpacing: 2 }}>{eyebrow}</div>}
            <div style={{ fontSize: logos.length > 1 ? 60 : 72, fontWeight: 800, lineHeight: 1.05, letterSpacing: -2, marginTop: 8 }}>{title}</div>
            {subtitle && <div style={{ fontSize: 32, marginTop: 20, opacity: 0.9 }}>{subtitle}</div>}
          </div>
        </div>
        <div style={{ display: 'flex', fontSize: 24, opacity: 0.75 }}>Wedstrijden · Zenders · Stand · Topscorers</div>
      </div>
    ),
    OG_SIZE
  )
}

/** Site-wide social image for pages that set their own openGraph block without a route-specific image. */
export const OG_DEFAULT_IMAGES = [{ url: '/opengraph-image', width: 1200, height: 630, alt: 'Eredivisie.tv' }]
