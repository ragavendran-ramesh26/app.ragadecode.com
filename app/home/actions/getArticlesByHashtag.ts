export type RawArticle = {
  id: number;
  document_id: string;
  title: string;
  slug: string;
  short_description?: string | null;
  published_at?: string | null; 
  coverimage?: { url?: string } | null;
  author?: { name?: string } | null;
  countries?: { title?: string }[];
  states?: { title?: string }[];
  cities?: { title?: string }[];
};

type APIResponse = { data: RawArticle[] };

const BASE = (process.env.RAGA_API_BASE || '').replace(/\/+$/, '');
const KEY  = process.env.RAGA_API_KEY;

function buildUrl(hashtag: string, limit: number) {
  // populate what the ArticleCard uses
  const populate =
    'populate[coverimage]=true' +
    '&populate[author]=true' +
    '&populate[countries]=true' +
    '&populate[states]=true' +
    '&populate[cities]=true';

  // you can add ordering/pagination later if needed
  return `${BASE}/news-articles/?hashtag=${encodeURIComponent(hashtag)}&${populate}`;
}

export async function getArticlesByHashtag(hashtag: string, limit = 12) {
  if (!BASE || !KEY) return { data: [], error: 'RAGA_API_BASE/RAGA_API_KEY not set' as string | undefined };
  const url = buildUrl(hashtag, limit);

  try {
    const res = await fetch(url, {
      headers: { 'x-api-key': KEY, 'Content-Type': 'application/json' },
      next: { revalidate: 60 },
    });
    if (!res.ok) return { data: [], error: `Fetch failed: ${res.status} ${res.statusText}` };
    const json = (await res.json()) as APIResponse;
    const data = Array.isArray(json?.data) ? json.data.slice(0, limit) : [];
    return { data };
  } catch (e: any) {
    return { data: [], error: e?.message || String(e) };
  }
}

export async function getArticlesForHashtags(hashtags: string[], limit = 12) {
  const results = await Promise.all(hashtags.map((h) => getArticlesByHashtag(h, limit)));
  const map: Record<string, RawArticle[]> = {};
  hashtags.forEach((h, i) => { map[h] = results[i].data || []; });
  const errors = results.map(r => r.error).filter(Boolean) as string[];
  return { data: map, error: errors[0] };
}
