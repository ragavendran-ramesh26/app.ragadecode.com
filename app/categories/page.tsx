import Link from 'next/link';
import BackButton from '@/app/article/[id]/BackButton';
import { getCategories } from '@/app/home/actions/getCategories';
import CategoriesIndexTabBar from './CategoriesIndexTabBar';
import { getCategoryCounts } from './actions/getCategoryCounts';

import {
  FaPlane, FaTrain, FaGraduationCap, FaFilm, FaMobileAlt, FaTags,
  FaLandmark, FaShieldAlt, FaMicrochip, FaRoute, FaNewspaper,
  FaChartBar, FaRegFolder, FaCar
} from 'react-icons/fa';

function hueFromSlug(slug: string) {
  let h = 0;
  for (let i = 0; i < slug.length; i++) h = (h * 31 + slug.charCodeAt(i)) >>> 0;
  return h % 360;
}
function iconForSlug(slug: string) {
  const s = slug.toLowerCase();
  if (s.includes('airline')) return FaPlane;
  if (s.includes('automobile') || s.includes('vehicle') || s.includes('car')) return FaCar;
  if (s.includes('rail')) return FaTrain;
  if (s.includes('exam')) return FaGraduationCap;
  if (s.includes('ott')) return FaFilm;
  if (s.includes('gadget') || s.includes('techno')) return FaMobileAlt;
  if (s.includes('deal')) return FaTags;
  if (s.includes('financ') || s.includes('bank')) return FaLandmark;
  if (s === 'iaf' || s.includes('armed')) return FaShieldAlt;
  if (s.includes('tech') || s.includes('micro')) return FaMicrochip;
  if (s.includes('tourism') || s.includes('travel')) return FaRoute;
  if (s.includes('news')) return FaNewspaper;
  if (s.includes('statistic') || s.includes('data')) return FaChartBar;
  return FaRegFolder;
}

export const dynamic = 'force-dynamic';

export default async function CategoriesIndexPage() {
  const { data, error } = await getCategories();
  const list = [...data].sort((a, b) => a.name.localeCompare(b.name));

  // fetch counts server-side (N parallel tiny calls)
  const counts = await getCategoryCounts(list.map((c) => c.slug));

  return (
    <main className="pb-24">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="px-4">
          <div className="flex items-center gap-3 py-3">
            <BackButton icon size={32} className="shrink-0 bg-white/95" />
            <div className="min-w-0">
              <h1 className="text-xl font-semibold leading-6">Categories</h1>
              <p className="text-sm text-gray-500 leading-5">
                {error ? 'Error loading' : `${list.length} category${list.length === 1 ? '' : 'ies'}`}
              </p>
            </div>
          </div>
        </div>

        {/* Grid */}
        <div className="px-4">
          {error ? (
            <div className="py-12 text-center text-gray-600">{error}</div>
          ) : !list.length ? (
            <ul className="grid grid-cols-2 gap-3 sm:gap-4">
              {Array.from({ length: 6 }).map((_, i) => (
                <li key={i} className="rounded-2xl border bg-gray-50 h-28 animate-pulse" />
              ))}
            </ul>
          ) : (
            <ul className="grid grid-cols-2 gap-3 sm:gap-4">
              {list.map((c) => {
                const hue = hueFromSlug(c.slug);
                const text = `hsl(${hue} 60% 18%)`;
                const bg = `hsl(${hue} 95% 92% / 0.95)`;
                const badgeFg = `hsl(${hue} 70% 30%)`;
                const badgeBg = `hsl(${hue} 95% 98%)`;
                const Icon = iconForSlug(c.slug);
                const count = counts[c.slug] ?? 0;

                return (
                  <li key={c.documentId}>
                    <Link
                      href={`/categories/${c.slug}`}
                      className="block rounded-2xl border shadow-sm hover:shadow transition focus:outline-none focus-visible:ring-2"
                      style={{ backgroundColor: bg, color: text }}
                      aria-label={c.name}
                      title={c.name}
                    >
                      <div className="p-3 h-28 flex flex-col">
                        <div
                          className="grid place-items-center rounded-full w-7 h-7 mb-2"
                          style={{
                            color: badgeFg,
                            backgroundColor: badgeBg,
                            boxShadow: 'inset 0 0 0 1px rgba(0,0,0,0.06)',
                          }}
                          aria-hidden
                        >
                          <Icon className="text-[13px]" />
                        </div>
                        <div className="mt-auto">
                          <h2 className="text-[15px] font-semibold leading-5 line-clamp-2">{c.name}</h2>
                          <p className="text-[12px] text-gray-600 mt-0.5">
                            {count} item{count === 1 ? '' : 's'}
                          </p>
                        </div>
                      </div>
                    </Link>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      </div>

      <CategoriesIndexTabBar />
    </main>
  );
}
