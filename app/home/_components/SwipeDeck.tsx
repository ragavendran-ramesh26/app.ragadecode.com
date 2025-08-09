'use client';

import { useMemo } from 'react';
import ArticleCard from '@/app/[year]/[month]/[day]/_components/ArticleCard';
import type { ArticleItem } from '@/app/[year]/[month]/[day]/_types';
import type { RawArticle } from '@/app/home/actions/getArticlesByHashtag';

function toArticleItem(a: RawArticle): ArticleItem {
  const country = a.countries?.[0]?.title || '';
  const state   = a.states?.[0]?.title || '';
  const city    = a.cities?.[0]?.title || '';
  return {
    document_id: a.documentId,
    title: a.title,
    image: a.coverimage?.url || '',
    short_description: a.short_description || '',
    author: a.author?.name || 'RagaDecode',
    country, state, city,
    slug: a.slug || '',
    // category: a.category?.title || '',
    // category_slug: a.category?.slug || '',
  };
}

function SkeletonLi() {
  return (
    <li className="rounded-xl border bg-white shadow-sm p-3">
      <div className="h-5 w-40 bg-gray-100 rounded mb-3 animate-pulse" />
      <div className="h-44 w-full bg-gray-100 rounded-lg animate-pulse" />
      <div className="h-4 w-5/6 bg-gray-100 rounded mt-3 animate-pulse" />
      <div className="h-3 w-1/2 bg-gray-100 rounded mt-2 animate-pulse" />
    </li>
  );
}

export default function SwipeDeck({
  title,
  rawArticles,
  loading = false,
}: {
  title: string;
  rawArticles?: RawArticle[];
  loading?: boolean;
}) {
  const items = useMemo(
    () => (Array.isArray(rawArticles) ? rawArticles : []).map(toArticleItem),
    [rawArticles]
  );

  if (!loading && items.length === 0) return null;

  return (
    <section className="mt-6">
      <div className="mb-2 flex items-center justify-between">
        <h2 className="text-lg font-bold">{title}</h2>
        <span className="text-xs text-gray-500">
          {loading ? 'Loading…' : `${items.length} items`}
        </span>
      </div>

      {/* Horizontal grid scroller: each LI is a column (no wrapper divs) */}
      <ul
        className={`
          list-none pl-0
          grid grid-flow-col auto-cols-[86vw] sm:auto-cols-[360px] gap-3
          overflow-x-auto snap-x snap-mandatory pb-1
          [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden
          [&>li]:snap-start
        `}
        role="list"
        aria-label={`${title} articles`}
      >
        {loading
          ? Array.from({ length: 3 }).map((_, i) => <SkeletonLi key={i} />)
          : items.map((it) => <ArticleCard key={it.document_id} article={it} />)}
      </ul>
    </section>
  );
}
