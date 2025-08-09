import { BASE_URL, apiHeaders, assertEnv } from '@/app/lib/api';

export type Category = {
  id: number;
  documentId: string;
  name: string;
  slug: string;
  seo_title: string;
  meta_description: string;
  short_description: string;
  cover_image: string | null;
  created_at: string;
  updated_at: string;
  published_at: string;
};

type CategoriesAPIResponse = { data: Category[] };

export async function getCategories(): Promise<{ data: Category[]; error?: string }> {
  try {
    assertEnv();
  } catch (e: any) {
    return { data: [], error: e?.message || String(e) };
  }

  const url = `${BASE_URL}/categories/`;

  try {
    const res = await fetch(url, {
      headers: apiHeaders(),
      next: { revalidate: 60 }, // same as your incidents page
    });

    if (!res.ok) {
      // surface status with URL to debug quickly
      return { data: [], error: `Fetch failed: ${res.status} ${res.statusText} (${url})` };
    }

    const json = (await res.json()) as CategoriesAPIResponse;

    // Your /categories/ returns { data: [...] }, so guard that
    if (!json || !Array.isArray(json.data)) {
      return { data: [], error: `Unexpected response shape from ${url}` };
    }

    return { data: json.data };
  } catch (e: any) {
    return { data: [], error: e?.message || String(e) };
  }
}
