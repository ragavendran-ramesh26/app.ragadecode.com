// app/author/[id]/page.tsx
import type { Metadata } from 'next';
import { marked } from 'marked';
import DOMPurify from 'isomorphic-dompurify';
import Link from 'next/link';

const BASE_URL = process.env.RAGA_API_BASE!;
const API_KEY  = process.env.RAGA_API_KEY!;

type Author = {
  name?: string;
  nick?: string;
  slug?: string;
  email?: string;
  facebook?: string | null;
  instagram?: string | null;
  twitter?: string | null;
  linkedin?: string | null;
  bio?: string; // markdown
  profile_image?: {
    url?: string;
    formats?: { small?: { url?: string }; thumbnail?: { url?: string } };
  };
};

async function fetchAuthor(id: string): Promise<Author | null> {
  if (!BASE_URL || !API_KEY) return null;
  const res = await fetch(`${BASE_URL}/authors/${id}`, {
    headers: { 'x-api-key': API_KEY },
    ...(process.env.NODE_ENV === 'development'
      ? { cache: 'no-store' as const }
      : { next: { revalidate: 300 } as const }),
  });
  if (!res.ok) return null;
  const json = await res.json();
  return json?.data ?? null;
}

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  const author = await fetchAuthor(id);
  const title = author?.name ? `About ${author.name}` : 'Author';
  return {
    title,
    description: author?.nick ? `About ${author.nick}` : 'About the author',
    openGraph: { title, description: author?.nick || '' },
  };
}

export default async function AuthorPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const author = await fetchAuthor(id);
  if (!author) {
    return (
      <main className="min-h-screen bg-gray-50 w-full max-w-[900px] mx-auto">
        <header className="bg-white sticky top-0 z-20 border-b">
          <div className="px-4 py-3 flex items-center justify-between">
            <h1 className="text-base font-semibold">Author</h1>
            <Link href="/" className="rounded-full border px-3 py-1 text-sm hover:bg-gray-50">Close</Link>
          </div>
        </header>
        <div className="px-4 py-6 text-sm text-gray-600">Author not found.</div>
      </main>
    );
  }

  const photo =
    author.profile_image?.url ||
    author.profile_image?.formats?.small?.url ||
    author.profile_image?.formats?.thumbnail?.url ||
    '';

  marked.setOptions({ gfm: true, breaks: true });
  const html = author.bio ? DOMPurify.sanitize(await marked.parse(author.bio)) : null;

  return (
    <main className="min-h-screen bg-gray-50 w-full max-w-[900px] mx-auto">
      <header className="bg-white sticky top-0 z-20 border-b">
        <div className="px-4 py-3 flex items-center justify-between">
          <h1 className="text-base font-semibold">About {author.name || 'Author'}</h1>
          <Link href="/" className="rounded-full border px-3 py-1 text-sm hover:bg-gray-50">Close</Link>
        </div>
      </header>

      <section className="px-4 py-5">
        <div className="bg-white rounded-2xl shadow-sm border p-5">
          <div className="flex items-center gap-4">
            <div className="h-16 w-16 overflow-hidden rounded-full bg-gray-100 flex-shrink-0">
              {photo ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={photo} alt={author.name || 'Author'} className="h-full w-full object-cover" />
              ) : (
                <div className="h-full w-full grid place-items-center text-gray-400">NA</div>
              )}
            </div>
            <div className="min-w-0">
              <h2 className="text-lg font-bold text-gray-900 truncate">{author.name || 'Author'}</h2>
              {author.nick && <p className="text-sm text-gray-500">“{author.nick}”</p>}
              {author.email && <p className="text-xs text-gray-500 mt-1">{author.email}</p>}
            </div>
          </div>

          {(author.twitter || author.instagram || author.linkedin || author.facebook) && (
            <div className="mt-4 flex flex-wrap gap-2">
              {author.twitter && <a className="text-sm rounded-full border px-3 py-1 hover:bg-gray-50" href={author.twitter} target="_blank" rel="noreferrer">X / Twitter</a>}
              {author.instagram && <a className="text-sm rounded-full border px-3 py-1 hover:bg-gray-50" href={author.instagram} target="_blank" rel="noreferrer">Instagram</a>}
              {author.linkedin && <a className="text-sm rounded-full border px-3 py-1 hover:bg-gray-50" href={author.linkedin} target="_blank" rel="noreferrer">LinkedIn</a>}
              {author.facebook && <a className="text-sm rounded-full border px-3 py-1 hover:bg-gray-50" href={author.facebook} target="_blank" rel="noreferrer">Facebook</a>}
            </div>
          )}

          <div className="mt-5">
            {html ? (
              <article
                className="prose prose-sm max-w-none prose-headings:font-semibold prose-headings:text-gray-900 prose-p:text-gray-800 prose-strong:text-gray-900 prose-a:text-blue-600 prose-a:no-underline hover:prose-a:underline prose-ul:my-3 prose-ol:my-3 prose-li:my-1 prose-blockquote:border-l-4 prose-blockquote:border-gray-200 prose-blockquote:text-gray-700"
                // @ts-ignore sanitized HTML
                dangerouslySetInnerHTML={{ __html: html }}
              />
            ) : (
              <p className="text-sm text-gray-600">Author bio will appear here.</p>
            )}
          </div>
        </div>
      </section>
    </main>
  );
}
