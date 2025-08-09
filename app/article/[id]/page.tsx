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

type ApiImageFormat = {
    ext?: string;
    url?: string;
    hash?: string;
    mime?: string;
    name?: string;
    path?: string | null;
    size?: number;
    width?: number;
    height?: number;
    sizeInBytes?: number;
};

type ApiImageFormats = {
    small?: ApiImageFormat;
    thumbnail?: ApiImageFormat;
};

type ApiAuthor = {
    name?: string;
    documentId?: string;
    profile_image?: {
        formats?: ApiImageFormats;
    };
};

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
    author?: ApiAuthor;
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
            className="min-h-screen w-full bg-white"
            style={{
                paddingTop: "max(env(safe-area-inset-top), 16px)",
                paddingBottom: "env(safe-area-inset-bottom)",
            }}
        >
            <div className="w-full max-w-md mx-auto px-4">
                {/* Card */}
                <article className="relative pb-8">
                    {/* Floating icon buttons */}
                    <div className="relative px-4" style={{ paddingTop: "max(env(safe-area-inset-top), 12px)" }}>
                        <div className="h-12" />

                        <BackButton icon className="absolute left-0 top-0" />
                        <ShareButton icon title={title} text={art.short_description || title} url={publicWebUrl} className="absolute right-0 top-0" />

                        {/* Rounded image below buttons */}
                        {/* <img src={coverUrl!} alt={title} className="mt-3 w-full aspect-[16/9] object-cover rounded-2xl" /> */}
                    </div>

                    {/* Cover */}
                    <div className="mt-2">
                        {coverUrl ? (
                            <img
                                src={coverUrl}
                                alt={title}
                                className="w-full aspect-[16/9] object-cover rounded-2xl"
                                loading="eager"
                            />
                        ) : (
                            <div className="w-full aspect-[16/9] rounded-2xl bg-slate-100" />
                        )}
                    </div>

                    {/* Title */}
                    <h1 className="mt-4 text-[20px] leading-7 font-extrabold text-slate-900 tracking-tight">
                        {title}
                    </h1>

                    {/* Byline row */}
                    <div className="mt-3 flex items-center justify-between text-xs text-slate-500">
                        <div className="flex items-center gap-2">
                            {art.author?.profile_image?.formats?.small?.url ? (
                                <img
                                    src={art.author.profile_image.formats.small.url}
                                    alt={author || "Author"}
                                    className="h-6 w-6 rounded-full object-cover ring-1 ring-slate-200"
                                    loading="lazy"
                                />
                            ) : (
                                <span className="inline-block h-6 w-6 rounded-full bg-slate-100 ring-1 ring-slate-200" />
                            )}

                            {author ? (
                                art.author?.documentId ? (
                                    <Link
                                        href={`/author/${art.author.documentId}`}
                                        prefetch={false}
                                        className="text-slate-700 hover:underline"
                                    >
                                        {author}
                                    </Link>
                                ) : (
                                    <span className="text-slate-700">{author}</span>
                                )
                            ) : (
                                <span>RagaDecode</span>
                            )}
                        </div>

                        {publishedAt && !Number.isNaN(+publishedAt) && (
                            <time>{formatDateWithSuffix(publishedAtIST)}</time>
                        )}
                    </div>

                    {locationLine && <div className="mt-3 text-[11px] text-slate-400">{locationLine}</div>}

                    {/* Body */}
                    <div className="mt-3">
                        {html ? (
                            <article
                                className="
        prose prose-slate prose-sm max-w-none
        prose-headings:font-semibold prose-headings:text-slate-900
        prose-p:text-slate-700 prose-p:leading-7
        prose-a:text-blue-600 hover:prose-a:underline
        prose-strong:text-slate-900
        prose-img:rounded-xl
        prose-blockquote:border-l-4 prose-blockquote:border-slate-200
        prose-table:my-4 prose-th:bg-slate-50
        [table]:min-w-full [th,td]:px-3 [th,td]:py-2
      "
                                dangerouslySetInnerHTML={{ __html: html }}
                            />
                        ) : art.short_description ? (
                            <p className="text-sm text-slate-700 leading-7">{art.short_description}</p>
                        ) : (
                            <p className="text-sm text-slate-500">No content available.</p>
                        )}
                    </div>
                </article>
            </div>
        </main>
    );

}
