// app/[year]/[month]/[day]/_components/ArticleCard.tsx
'use client';

import { useRouter } from 'next/navigation';
import { ArticleItem } from '../_types';

export default function ArticleCard({ article }: { article: ArticleItem }) {
  const router = useRouter();
  const openInApp = () => router.push(`/article/${article.document_id}`);

  const hasImage = typeof article.image === 'string' && article.image.trim().length > 0;

  return (
    <li
      onClick={openInApp}
      className="cursor-pointer bg-white rounded-xl border shadow-sm p-3 hover:shadow-md transition active:scale-[.99]"
      role="button"
      aria-label={`Open article: ${article.title}`}
    >
      <h4 className="text-[15px] font-semibold text-gray-900">{article.title}</h4>

      <div className="mt-2 w-full overflow-hidden rounded-lg bg-gray-200">
        {hasImage ? (
          <img
            src={article.image!}
            alt={article.title || 'Article image'}
            className="w-full h-44 object-cover"
            loading="lazy"
          />
        ) : (
          <div className="w-full h-44 grid place-items-center text-[12px] text-gray-500">
            No image
          </div>
        )}
      </div>

      <p className="mt-2 text-[13px] text-gray-600 line-clamp-2">
        {article.short_description}
      </p>

      <div className="mt-2 text-[13px] text-gray-700 font-medium">
        By {article.author || 'RagaDecode'}
      </div>

      {(article.country || article.state || article.city) && (
        <div className="mt-1 text-[12px] text-gray-500 flex flex-wrap gap-1">
          {article.country && <span>{article.country}</span>}
          {article.state && article.country && <span>•</span>}
          {article.state && <span>{article.state}</span>}
          {article.city && (article.state || article.country) && <span>•</span>}
          {article.city && <span>{article.city}</span>}
        </div>
      )}
    </li>
  );
}
