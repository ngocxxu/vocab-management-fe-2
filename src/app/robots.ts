import type { MetadataRoute } from 'next';
import { getBaseUrl } from '@/utils/Helpers';

export default function robots(): MetadataRoute.Robots {
  const baseUrl = getBaseUrl();

  // Block everything in development
  if (process.env.NODE_ENV !== 'production') {
    return {
      rules: {
        userAgent: '*',
        disallow: '/',
      },
    };
  }

  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/dashboard', '/api/', '/auth/'],
    },
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
