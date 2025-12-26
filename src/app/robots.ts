import { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  const baseUrl = 'https://www.rsquareidea.my.id'

  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: [
          '/admin/',
          '/api/',
          '/checkout/',
          '/reward/',
          '/feedback/',
        ],
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
  }
}
