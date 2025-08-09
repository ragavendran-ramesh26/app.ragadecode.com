// app/categories/actions/getArticlesByCategory.ts
'use server';

import { BASE_URL, apiHeaders, assertEnv } from '@/app/lib/api';

export type ArticleItem = {
  document_id: string;
  title: string;
  image: string;
  short_description: string;
  author: string;
  country?: string;
  state?: string;
  city?: string;
  published_at?: string;
  slug?: string;
  id?: number | string;
};

type FetchResult = {
  items: ArticleItem[];
  error?: string;
  debug?: any; // keep while testing
};

function pickRaw(json: any): any[] {
  if (Array.isArray(json?.data)) return json.data;               // { data: [...] }
  if (Array.isArray(json?.results?.data)) return json.results.data; // { results: { data: [...] } }
  if (Array.isArray(json?.results)) return json.results;         // { results: [...] }
  return [];
}

function firstText(arr: any[] | undefined, keys: string[] = ['title', 'name']): string | undefined {
  if (!Array.isArray(arr) || !arr.length) return undefined;
  const obj = arr[0] || {};
  for (const k of keys) if (typeof obj[k] === 'string' && obj[k].trim()) return obj[k].trim();
  return undefined;
}

function joinTexts(arr: any[] | undefined, keys: string[] = ['title', 'name'], max = 2): string | undefined {
  if (!Array.isArray(arr) || !arr.length) return undefined;
  const out: string[] = [];
  for (const item of arr) {
    for (const k of keys) {
      if (typeof item[k] === 'string' && item[k].trim()) {
        out.push(item[k].trim());
        break;
      }
    }
    if (out.length >= max) break;
  }
  return out.length ? out.join(', ') : undefined;
}

function pickImage(raw: any): string | undefined {
  const direct = raw.image ?? raw.cover_image ?? raw.coverimage;
  if (typeof direct === 'string' && direct.trim()) return direct.trim();
  const u = direct?.url ?? direct?.formats?.small?.url ?? direct?.formats?.thumbnail?.url;
  return typeof u === 'string' && u.trim() ? u.trim() : undefined; // <-- not ''
}


function normalize(raw: any, idx: number): ArticleItem | null {
  const document_id =
    raw.document_id ??
    raw.documentId ??
    (raw.id != null ? String(raw.id) : undefined) ??
    (raw.slug ? `slug:${raw.slug}` : `row-${idx}`);

  // your API uses "Title"
  const title = raw.title ?? raw.Title ?? raw.headline ?? '';
  if (!title) return null;

  const country = firstText(raw.country ? [raw.country] : undefined) // in case single object
                 ?? joinTexts(raw.countries); // usual shape
  const state   = joinTexts(raw.states);
  const city    = joinTexts(raw.cities);

  return {
    document_id: String(document_id),
    title,
    image: pickImage(raw),
    short_description: raw.short_description ?? raw.summary ?? '',
    author: typeof raw.author === 'string' ? raw.author : raw.author?.name ?? '',
    country,
    state,
    city,
    published_at: raw.published_at ?? raw.publishedAt,
    slug: raw.slug,
    id: raw.id,
  };
}

export async function getArticlesByCategory(slug: string): Promise<FetchResult> {
  try { assertEnv(); } catch (e: any) {
    return { items: [], error: e?.message || String(e) };
  }

  const qs = new URLSearchParams({
    'category__slug': slug,
    ordering: '-published_at',
    // you can add expansions if needed:
    // 'populate[author]': 'true',
    // 'populate[coverimage]': 'true',
  });

  const url = `${BASE_URL}/news-articles/?${qs.toString()}`;
  const res = await fetch(url, { headers: apiHeaders(), cache: 'no-store' });

  let json: any = null;
  try { json = await res.json(); } catch {}

  const raw = pickRaw(json);
  const items = raw.map(normalize).filter(Boolean) as ArticleItem[];

  if (!res.ok) return { items: [], error: `HTTP ${res.status}`, debug: { url, keys: Object.keys(json || {}) } };
  if (!items.length) return { items: [], error: 'Empty after normalize()', debug: { url, keys: Object.keys(json || {}), sample: raw[0] } };

  return { items };
}
