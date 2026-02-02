import type { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
    const baseUrl = 'https://selfscore.net'

    return {
        rules: [
            {
                userAgent: '*',
                allow: [
                    '/',
                    '/ourMission/',
                    '/testInfo/',
                    '/contact/',
                    '/consultations/',
                    '/blogs/',
                    '/blog/',
                ],
                disallow: [
                    '/user/',
                    '/admin/',
                    '/consultant/',
                    '/auth/',
                    '/api/',
                    '/privacy-policy/',
                    '/terms-conditions/',
                    '/refund-policy/',
                    '/selfscoretest/',
                    '/shared-report/',
                ],
            },
        ],
        sitemap: `${baseUrl}/sitemap.xml`,
    }
}
