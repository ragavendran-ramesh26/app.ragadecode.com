// app/home/actions/getStateHeatmap.ts
'use server';

import { BASE_URL, apiHeaders, assertEnv } from '@/app/lib/api';
import { getStates, type State } from './getStates';
import { toGeoName } from '@/app/lib/stateNameNormalize';

const TAGS = ['murder', 'rape', 'accident', 'suicide'] as const;
type Tag = typeof TAGS[number];

export type HeatDatum = {
  value: number;
  metrics: Record<Tag, number>;
  meta?: { href?: string; label?: string; slug?: string };
};
export type Heatmap = Record<string, HeatDatum>; // key = exact GeoJSON st_nm

function buildCountURL(stateSlug: string, tag: Tag) {
  return `${BASE_URL}/news-articles/?country=india&state=${encodeURIComponent(stateSlug)}&hashtag=${encodeURIComponent(tag)}&count=true`;
}

async function fetchCount(url: string): Promise<number> {
  const res = await fetch(url, { headers: apiHeaders(), cache: 'no-store' });
  if (!res.ok) return 0;
  const json = await res.json().catch(() => null);
  if (typeof json === 'number') return json;
  if (typeof json?.count === 'number') return json.count;
  if (json?.meta?.count != null) return Number(json.meta.count) || 0;
  if (json?.total != null) return Number(json.total) || 0;
  return 0;
}

export async function getStateHeatmap(): Promise<{ data: Heatmap; error?: string }> {
  try {
    assertEnv();
  } catch (e: any) {
    return { data: {}, error: e?.message || String(e) };
  }

  const { data: states, error } = await getStates();
  if (error) return { data: {}, error };

  const indiaStates = states.filter(s => (s.country ?? '').toLowerCase() === 'india');

  try {
    const entries = await Promise.all(
      indiaStates.map(async (s: State) => {
        const counts = await Promise.all(TAGS.map(t => fetchCount(buildCountURL(s.slug, t))));
        const metrics = {
          murder: counts[0] || 0,
          rape: counts[1] || 0,
          accident: counts[2] || 0,
          suicide: counts[3] || 0,
        } as const;
        const total = Object.values(metrics).reduce((a, b) => a + b, 0);

        const geoName = toGeoName(s.name); // ← single source of truth
        return [
          geoName,
          {
            value: total,
            metrics: { ...metrics },
            meta: { href: `/locations/india/${s.slug}`, label: s.name, slug: s.slug },
          } as HeatDatum,
        ] as const;
      })
    );

    return { data: Object.fromEntries(entries) as Heatmap };
  } catch (e: any) {
    return { data: {}, error: e?.message || String(e) };
  }
}
