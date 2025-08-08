// app/static-pages/page.tsx
import Link from "next/link";

const BASE_URL = process.env.RAGA_API_BASE!;
const API_KEY  = process.env.RAGA_API_KEY!;

type StaticPage = {
  documentId: string;
  title: string;
  slug: string;
  created_date?: string;
};

async function fetchPages(): Promise<StaticPage[]> {
  const res = await fetch(`${BASE_URL}/static-pages`, {
    headers: { "x-api-key": API_KEY },
    next: { revalidate: 60 },
  });
  if (!res.ok) return [];
  const json = await res.json();
  return Array.isArray(json?.data) ? json.data : [];
}

export default async function StaticPagesIndex() {
  const pages = await fetchPages();

  return (
    <main className="min-h-screen bg-white w-full max-w-[900px] mx-auto">
      <div className="sticky top-0 z-20 bg-white border-b">
        <div className="flex items-center justify-between px-3 py-3">
          <h1 className="text-lg font-semibold">Info & Policies</h1>
          <Link href="/" className="rounded-full border px-3 py-1 text-sm hover:bg-gray-50">
            Close
          </Link>
        </div>
      </div>

      <div className="p-3 space-y-3">
        {pages.map(p => (
          <Link
            key={p.documentId}
            href={`/static-pages/${p.slug}`}
            className="block rounded-xl border p-4 hover:bg-gray-50"
          >
            <div className="flex items-start justify-between gap-3">
              <h2 className="text-base font-semibold">{p.title}</h2>
              <span className="text-gray-400">›</span>
            </div>
            {p.created_date && (
              <div className="mt-1 text-[12px] text-gray-500">Updated: {p.created_date}</div>
            )}
          </Link>
        ))}

        {!pages.length && (
          <p className="text-sm text-gray-500">No pages available.</p>
        )}
      </div>
    </main>
  );
}
