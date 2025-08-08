// app/about/author/page.tsx
import Link from "next/link";

const BASE_URL = process.env.RAGA_API_BASE!;
const API_KEY  = process.env.RAGA_API_KEY!;

type Author = {
  documentId: string;
  name?: string;
  nick?: string;
  bio?: string; // markdown
  profile_image?: {
    url?: string;
    formats?: {
      small?: { url?: string };
      thumbnail?: { url?: string };
    };
  };
};

async function fetchAuthors(): Promise<Author[]> {
  if (!BASE_URL || !API_KEY) {
    console.error("Missing RAGA_API_BASE or RAGA_API_KEY");
    return [];
  }
  const res = await fetch(`${BASE_URL}/authors`, {
    headers: { "x-api-key": API_KEY },
    // cache on the edge; tweak as you wish
    next: { revalidate: 3600 }, // 1 hour
  });
  if (!res.ok) return [];
  const json = await res.json();
  return Array.isArray(json?.data) ? json.data : [];
}

function pickAvatarUrl(a: Author) {
  return (
    a.profile_image?.formats?.small?.url ||
    a.profile_image?.formats?.thumbnail?.url ||
    a.profile_image?.url ||
    "https://placehold.co/96x96/png?text=RD"
  );
}

export const metadata = {
  title: "About Author | RagaDecode",
  description: "Meet the authors behind RagaDecode",
};

export default async function AboutAuthorPage() {
  const authors = await fetchAuthors();

  return (
    <main className="min-h-screen bg-white w-full max-w-[900px] mx-auto">
      {/* Top bar (simple) */}
      <div className="sticky top-0 z-20 bg-white border-b">
  <div className="flex items-center justify-between px-3 py-3">
    <h1 className="text-lg font-semibold">About Authors</h1>
    <Link
      href="/"
      className="rounded-full border px-3 py-1 text-sm hover:bg-gray-50"
    >
      Close
    </Link>
  </div>
</div>
      <div className="px-3 pb-24">
        {authors.length === 0 ? (
          <p className="text-sm text-gray-600 mt-6">No authors found.</p>
        ) : (
          <ul className="mt-4 space-y-3">
            {authors.map((a) => {
              const href = `/author/${a.documentId}`;
              const img = pickAvatarUrl(a);
              return (
                <li key={a.documentId}>
                  <Link
                    href={href}
                    className="flex items-center gap-3 rounded-xl border bg-white p-3 shadow-sm active:scale-[.99] hover:shadow-md transition"
                  >
                    <img
                      src={img}
                      alt={a.name || "Author"}
                      className="h-14 w-14 rounded-full object-cover bg-gray-100"
                      loading="lazy"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <h3 className="text-[15px] font-semibold text-gray-900 line-clamp-1">
                          {a.name || "Unknown"}
                        </h3>
                        {a.nick && (
                          <span className="rounded-full bg-gray-100 px-2 py-[2px] text-[11px] text-gray-700">
                            {a.nick}
                          </span>
                        )}
                      </div>
                      {/* Tiny bio preview */}
                      {a.bio && (
                        <p className="mt-1 text-[12px] text-gray-600 line-clamp-2">
                          {a.bio.replace(/[#*_>`]/g, "").slice(0, 140)}
                          {a.bio.length > 140 ? "…" : ""}
                        </p>
                      )}
                      <div className="mt-2 text-[12px] text-blue-600">View profile →</div>
                    </div>
                  </Link>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </main>
  );
}
