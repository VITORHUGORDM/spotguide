import type { MetadataRoute } from 'next';
import { SITE_URL } from '../lib/cidades';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [{ userAgent: '*', allow: '/', disallow: ['/comerciante', '/login', '/cadastro'] }],
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}
