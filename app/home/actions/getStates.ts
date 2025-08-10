'use server';

import { BASE_URL, apiHeaders, assertEnv } from '@/app/lib/api';

export type State = {
  id: number | string;
  name: string;   // from "title"
  slug: string;   // from "slug"
  country?: string; // prefer country.slug
};

type StatesAPIResponse = { data: any[] } | any[];

export async function getStates(): Promise<{ data: State[]; error?: string }> {
  try {
    assertEnv();
  } catch (e: any) {
    return { data: [], error: e?.message || String(e) };
  }

  const url = `${BASE_URL}/states?populate[country]=true`;

  try {
    const res = await fetch(url, {
      headers: apiHeaders(),
      next: { revalidate: 60 },
    });

    if (!res.ok) {
      return { data: [], error: `Fetch failed: ${res.status} ${res.statusText} (${url})` };
    }

    const json = (await res.json()) as StatesAPIResponse;
    const arr = Array.isArray((json as any)?.data) ? (json as any).data : (Array.isArray(json) ? json : []);

    const parsed = arr
      .map((item: any): State => {
        // your API is flat (id, title, slug, country: {title, slug})
        const a = item?.attributes ?? item;
        const name = a?.title ?? item?.title ?? '';              // ← title
        const slug = a?.slug ?? item?.slug ?? '';                // ← slug
        const country =
          a?.country?.slug ??
          a?.country?.title ??
          a?.country?.data?.attributes?.slug ??
          a?.country?.data?.attributes?.title;

        return { id: item?.id ?? slug, name, slug, country };
      })
      .filter((s) => s.name && s.slug);

    return { data: parsed };
  } catch (e: any) {
    return { data: [], error: e?.message || String(e) };
  }
}
