import type { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
    },
    sitemap: ['https://eredivisie.tv/sitemap.xml', 'https://eredivisie.tv/speler/sitemap.xml'],
  }
}
