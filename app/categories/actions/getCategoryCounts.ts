'use server';

import { BASE_URL, apiHeaders, assertEnv } from '@/app/lib/api';

export async function getCategoryCounts(slugs: string[]) {
  try { assertEnv(); } catch { return {}; }

  // Fetch counts in parallel; ask for 1 item to keep payload tiny
  const qs = (slug: string) =>
    `${BASE_URL}/news-articles/?category__slug=${encodeURIComponent(slug)}`;

  const results = await Promise.all(
    slugs.map(async (slug) => {
      try {
        const res = await fetch(qs(slug), {
          headers: apiHeaders(),
          next: { revalidate: 300 },
        });
        if (!res.ok) return [slug, 0] as const;
        const json = await res.json();

        // Prefer DRF count
        if (typeof json?.count === 'number') return [slug, json.count] as const;

        // Fallback: non-paginated { data: [...] }
        if (Array.isArray(json?.data)) return [slug, json.data.length] as const;

        // Another fallback: { results: [...] }
        if (Array.isArray(json?.results)) return [slug, json.results.length] as const;

        // { results: { data: [...] } }
        if (Array.isArray(json?.results?.data)) return [slug, json.results.data.length] as const;

        return [slug, 0] as const;
      } catch {
        return [slug, 0] as const;
      }
    })
  );

  return Object.fromEntries(results) as Record<string, number>;
}
