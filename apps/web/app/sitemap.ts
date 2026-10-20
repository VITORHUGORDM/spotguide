import type { MetadataRoute } from 'next';
import { ESTADOS } from '@guia/contracts/brasil';
import { CIDADES, SITE_URL } from '../lib/cidades';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:3333/api/v1';

export const revalidate = 3600;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const agora = new Date();

  const fixas: MetadataRoute.Sitemap = [
    { url: SITE_URL, lastModified: agora, changeFrequency: 'weekly', priority: 1 },
    { url: `${SITE_URL}/locais`, lastModified: agora, changeFrequency: 'daily', priority: 0.9 },
    { url: `${SITE_URL}/estados`, lastModified: agora, changeFrequency: 'weekly' as const, priority: 0.8 },
    ...ESTADOS.map((e) => ({
      url: `${SITE_URL}/estados/${e.slug}`,
      lastModified: agora,
      changeFrequency: 'weekly' as const,
      priority: 0.7,
    })),
    ...CIDADES.map((c) => ({
      url: `${SITE_URL}/cidades/${c.slug}`,
      lastModified: agora,
      changeFrequency: 'weekly' as const,
      priority: 0.8,
    })),
  ];

  let lugares: MetadataRoute.Sitemap = [];
  try {
    const res = await fetch(`${API_BASE_URL}/places?limit=50`, { next: { revalidate: 3600 } });
    if (res.ok) {
      const lista: { slug: string }[] = await res.json();
      lugares = lista.map((l) => ({
        url: `${SITE_URL}/locais/${l.slug}`,
        lastModified: agora,
        changeFrequency: 'weekly' as const,
        priority: 0.7,
      }));
    }
  } catch {
    // sem API no build: o sitemap sai só com as páginas fixas
  }

  return [...fixas, ...lugares];
}
