// app/static-pages/[slug]/page.tsx
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { marked } from "marked";
import DOMPurify from "isomorphic-dompurify";

const BASE_URL = process.env.RAGA_API_BASE!;
const API_KEY  = process.env.RAGA_API_KEY!;

type StaticPage = {
  title?: string;
  slug?: string;
  content?: string;
  created_date?: string;
};

async function fetchPage(slug: string): Promise<StaticPage | null> {
  const res = await fetch(`${BASE_URL}/static-pages`, {
    headers: { "x-api-key": API_KEY },
    next: { revalidate: 120 },
  });
  if (!res.ok) return null;

  const json = await res.json();
  const list: StaticPage[] = Array.isArray(json?.data) ? json.data : [];
  return list.find(p => p.slug === slug) ?? null;
}

/* SEO */
export async function generateMetadata(
  { params }: { params: Promise<{ slug: string }> }
): Promise<Metadata> {
  const { slug } = await params;                 // ✅ await the promise
  const page = await fetchPage(slug);
  if (!page) return { title: "Page not found" };
  return {
    title: page.title || "Info",
    description: page.title || "Information page",
    alternates: { canonical: `/static-pages/${slug}` },
  };
}

/* PAGE */
export default async function StaticPage(
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;                 // ✅ await the promise
  const page = await fetchPage(slug);
  if (!page) return notFound();

  marked.setOptions({ gfm: true, breaks: true });
  let html = await marked.parse(page.content ?? "");
  html = DOMPurify.sanitize(html);

  return (
    <main className="min-h-screen bg-white w-full max-w-[900px] mx-auto">
      <div className="sticky top-0 z-20 bg-white border-b">
        <div className="flex items-center justify-between px-3 py-3">
          <h1 className="text-lg font-semibold line-clamp-1">{page.title}</h1>
          <Link href="/static-pages" className="rounded-full border px-3 py-1 text-sm hover:bg-gray-50">
            Back
          </Link>
        </div>
      </div>

      <div className="p-3">
        <article
          className="prose prose-sm max-w-none prose-headings:font-semibold prose-headings:text-gray-900
                     prose-p:text-gray-800 prose-a:text-blue-600 prose-a:no-underline hover:prose-a:underline
                     prose-strong:text-gray-900 prose-blockquote:border-l-4 prose-blockquote:border-gray-200
                     prose-pre:bg-gray-50 prose-pre:p-3 prose-pre:rounded-md prose-table:my-4 prose-th:bg-gray-50"
          dangerouslySetInnerHTML={{ __html: html }}
        />
      </div>
    </main>
  );
}
