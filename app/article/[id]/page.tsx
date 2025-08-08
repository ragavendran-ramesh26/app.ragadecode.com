// app/article/[id]/page.tsx
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { marked } from "marked";
import DOMPurify from "isomorphic-dompurify";
import BackButton from "./BackButton";
import ShareButton from "./ShareButton";
import Link from "next/link";

type IdParams = { id: string };


const BASE_URL = process.env.RAGA_API_BASE!;
const API_KEY = process.env.RAGA_API_KEY!;

type ApiCoverFormats = { small?: { url?: string }; thumbnail?: { url?: string } };
type ApiCover = { url?: string; formats?: ApiCoverFormats };
type ApiArticle = {
    Title?: string;
    slug?: string;
    short_description?: string;
    Description_in_detail?: string; // markdown
    image?: string;                  // legacy
    coverimage?: ApiCover;           // preferred
    publishedAt?: string;
    country?: string;
    state?: string;
    city?: string;
    category?: { slug?: string };
    countries?: Array<{ title?: string }>;
    states?: Array<{ title?: string }>;
    cities?: Array<{ title?: string }>;
    author?: { name?: string; documentId?: string };
};

function formatDateWithSuffix(date: Date) {
    const day = date.getDate();
    const month = new Intl.DateTimeFormat('en-GB', { month: 'long' }).format(date); // "July"
    const year = date.getFullYear();

    const suffix =
        day % 10 === 1 && day !== 11 ? 'st' :
            day % 10 === 2 && day !== 12 ? 'nd' :
                day % 10 === 3 && day !== 13 ? 'rd' : 'th';

    return `${day}${suffix} ${month} ${year}`;
}

function buildLocationLine(art: any) {
    const getTitles = (arr?: Array<{ title?: string }>) =>
        Array.isArray(arr) ? arr.map(x => x?.title).filter(Boolean) as string[] : [];

    // Use the first item from each list (or join multiple if you prefer)
    const country = getTitles(art.countries)[0];
    const state = getTitles(art.states)[0];
    const city = getTitles(art.cities)[0];

    // If you want to show *all* values, do:
    // const country = getTitles(art.countries).join(', ');
    // const state   = getTitles(art.states).join(', ');
    // const city    = getTitles(art.cities).join(', ');

    const parts = [country, state, city].filter(Boolean);
    return parts.length ? parts.join(' • ') : null;
}

async function fetchRaw(id: string): Promise<any | null> {
    if (!BASE_URL || !API_KEY) return null;
    const res = await fetch(`${BASE_URL}/news-articles/${id}`, {
        headers: { "x-api-key": API_KEY },
        ...(process.env.NODE_ENV === "development"
            ? { cache: "no-store" as const }
            : { next: { revalidate: 60 } as const }),
    });
    if (!res.ok) return null;
    return res.json();
}

function pickCoverUrl(cover?: ApiCover, legacy?: string) {
    return cover?.url || cover?.formats?.small?.url || legacy || null;
}

function normalize(payload: any): (ApiArticle & { coverUrl: string | null }) | null {
    const d: any = payload?.data ?? payload;
    if (!d || typeof d !== "object") return null;
    return {
        Title: d.Title,
        slug: d.slug,
        short_description: d.short_description,
        Description_in_detail: d.Description_in_detail,
        image: d.image,
        coverimage: d.coverimage,
        author: d.author,
        publishedAt: d.publishedAt,
        country: d.country,
        state: d.state,
        city: d.city,
        category: d.category,
        coverUrl: pickCoverUrl(d.coverimage, d.image),
        countries: d.countries,   // NEW
        states: d.states,         // NEW
        cities: d.cities,         // NEW
    } as any;
}

/* ------------ SEO ------------ */
export async function generateMetadata({ params }: { params: Promise<IdParams> }): Promise<Metadata> {
    const { id } = await params;
    const raw = await fetchRaw(id);
    const art = normalize(raw);
    if (!art) return { title: "Article not found" };

    return {
        title: art.Title || "Article",
        description: art.short_description || "",
        openGraph: {
            title: art.Title || "Article",
            description: art.short_description || "",
            images: art.coverUrl ? [{ url: art.coverUrl }] : undefined,
            type: "article",
        },
    };
}

/* ------------ PAGE ------------ */
export default async function ArticlePage({ params }: { params: Promise<IdParams> }) {
    const { id } = await params;
    const raw = await fetchRaw(id);
    const art = normalize(raw);
    if (!art) return notFound();

    const title = art.Title || "Untitled";
    const publicWebUrl =
        art.category?.slug && art.slug
            ? `https://ragadecode.com/${art.category.slug}/${art.slug}`
            : undefined; // ShareButton will fallback to current URL if undefined
    const author = art.author?.name;
    const publishedAt = art.publishedAt ? new Date(art.publishedAt) : undefined;
    const publishedAtIST = publishedAt
        ? new Date(publishedAt.toLocaleString('en-US', { timeZone: 'Asia/Kolkata' }))
        : undefined;
    const coverUrl = art.coverUrl;
    const md = art.Description_in_detail ?? "";
    marked.setOptions({
        gfm: true,        // <-- enables tables, strikethrough, task lists
        breaks: true,     // line breaks behave like GitHub markdown
    });
    let rawHtml = await marked.parse(md);
    rawHtml = rawHtml.replace(/<a [^>]*>(.*?)<\/a>/gi, "$1");
    const html = DOMPurify.sanitize(rawHtml); // safe to render

    const locationLine = buildLocationLine(art);

    return (
        <main
            className="min-h-screen bg-gray-50 w-full max-w-[900px] mx-auto"
            style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
        >
            {/* Rounded article card */}
            <div className="mx-0 mt-0 mb-6 bg-white rounded-none overflow-hidden shadow-none">
                {/* Hero with overlay + actions */}
                <section className="relative">
                    {/* Image */}
                    {coverUrl ? (
                        <img
                            src={coverUrl}
                            alt={title}
                            className="h-64 w-full object-cover"
                            loading="eager"
                        />
                    ) : (
                        <div className="h-64 w-full bg-gray-200" />
                    )}

                    {/* Dark gradient for legible text */}
                    <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-black/0" />

                    {/* Top actions */}
                    <div className="absolute top-3 left-3 right-3 flex items-center justify-between gap-2">
                        <BackButton className="bg-white/90 hover:bg-white text-gray-900 shadow-sm" />
                        <ShareButton
                            title={title}
                            text={art.short_description || title}
                            url={publicWebUrl}
                            className="bg-white/90 hover:bg-white text-gray-900 shadow-sm"
                        />
                    </div>

                    {/* Title + meta over image */}
                    <div className="absolute bottom-4 left-4 right-4">
                        <h1 className="text-white text-[22px] font-extrabold leading-snug drop-shadow">
                            {title}
                        </h1>
                        <div className="mt-1 text-white/90 text-[12px] flex flex-wrap items-center gap-2">
                            {author && (
                                art.author?.documentId ? (
                                    <Link
                                        href={`/author/${art.author.documentId}`}
                                        prefetch={false}
                                        className="underline underline-offset-2 hover:text-white"
                                    >
                                        By {author}
                                    </Link>
                                ) : (
                                    <Link
                                        href="/about/author"
                                        className="underline underline-offset-2 hover:text-white"
                                    >
                                        By {author}
                                    </Link>
                                )
                            )}
                            {publishedAt && !Number.isNaN(+publishedAt) && (
                                <span>• {formatDateWithSuffix(publishedAtIST)}</span>
                            )}
                        </div>

                        {locationLine && (
                            <div className="text-white/80 text-[11px] mt-1">
                                {locationLine}
                            </div>
                        )}

                    </div>

                </section>

                {/* Body */}
                <section className="px-4 pt-4 pb-6">


                    {/* Content */}
                    {html ? (
                        <div className="mt-2">
                            {/* Let tables scroll on small screens */}
                            <div className="overflow-x-auto rounded-lg border border-gray-100">
                                <article
                                    className="
          prose prose-sm max-w-none px-3 py-4
          prose-headings:font-semibold prose-headings:text-gray-900
          prose-p:text-gray-800
          prose-a:text-blue-600 prose-a:no-underline hover:prose-a:underline
          prose-strong:text-gray-900
          prose-blockquote:border-l-4 prose-blockquote:border-gray-200 prose-blockquote:text-gray-700
          prose-code:text-pink-600 prose-pre:bg-gray-50 prose-pre:p-3 prose-pre:rounded-md
          prose-img:rounded-lg
          prose-table:my-4 prose-th:font-semibold prose-th:bg-gray-50
          prose-hr:my-6
          [table]:min-w-full [table]:text-left [th,td]:px-3 [th,td]:py-2
          [tr]:border-b [tr]:border-gray-100 first:[tr]:border-t-0
        "
                                    // trusted HTML from your backend (now sanitized)
                                    dangerouslySetInnerHTML={{ __html: html }}
                                />
                            </div>
                        </div>
                    ) : art.short_description ? (
                        <p className="text-sm text-gray-800">{art.short_description}</p>
                    ) : (
                        <p className="text-sm text-gray-500">No content available.</p>
                    )}
                </section>
            </div>

            {/* Sticky bottom share (mobile) */}
            <div className="lg:hidden fixed bottom-0 inset-x-0 z-30 border-t bg-white/95 backdrop-blur">
                <div className="px-3 py-2 flex items-center justify-between">
                    <span className="text-[12px] text-gray-500 line-clamp-1">
                        {art.short_description || "Read more on Raga Decode"}
                    </span>
                    <ShareButton
                        title={title}
                        text={art.short_description || title}
                        url={publicWebUrl}
                    />

                </div>
            </div>
        </main>
    );
}
