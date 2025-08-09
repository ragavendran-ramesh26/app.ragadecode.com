'use client';

import Link from 'next/link';
import { useMemo } from 'react';
import type { Category } from '@/app/home/actions/getCategories';

type Props = {
  categories?: Category[];
  onSelectSlug?: (slug: string) => void;
  dense?: boolean;
  useIcons?: boolean; // set true if you want icons instead of letters
};

/* ---------- helpers ---------- */

function hueFromSlug(slug: string) {
  let h = 0;
  for (let i = 0; i < slug.length; i++) h = (h * 31 + slug.charCodeAt(i)) >>> 0;
  return h % 360;
}

function initials(name = '') {
  return name
    .replace(/&/g, ' ')
    .replace(/[^a-zA-Z0-9\s]/g, '')
    .trim()
    .split(/\s+/)
    .slice(0, 3)
    .map(w => w[0]?.toUpperCase() || '')
    .join('') || '•';
}

import {
  FaPlane, FaTrain, FaGraduationCap, FaFilm, FaMobileAlt, FaTags,
  FaLandmark, FaShieldAlt, FaMicrochip, FaRoute, FaNewspaper,
  FaChartBar, FaRegFolder, FaCar
} from 'react-icons/fa';

function iconForSlug(slug: string) {
  const s = (slug || '').toLowerCase();
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

/** Mild, stable gradient from slug */
function gradientFromSlug(slug: string) {
  const h = hueFromSlug(slug);
  const a = `hsl(${h} 85% 95% / .98)`;
  const b = `hsl(${h} 85% 88% / .98)`;
  return `linear-gradient(135deg, ${a}, ${b})`;
}

/* ---------- badge ---------- */

function RoundBadge({
  name,
  slug,
  href,
  onClick,
  dense,
  useIcons,
}: {
  name: string;
  slug: string;
  href?: string;
  onClick?: () => void;
  dense?: boolean;
  useIcons?: boolean;
}) {
  const size = dense ? 56 : 64;
  const font = dense ? 'text-[18px]' : 'text-[20px]';

  const h = hueFromSlug(slug);
  const fg = `hsl(${h} 55% 22%)`;
  const ring = `hsl(${h} 60% 45% / .35)`;
  const border = `hsl(${h} 35% 45% / .22)`;

  const common = {
    className: 'group flex flex-col items-center justify-start gap-1.5 focus:outline-none',
    style: { width: size + 6 },
    title: name,
    'aria-label': name,
  } as any;

  const Icon = iconForSlug(slug);

  const inner = (
    <>
      <span
        className="grid place-items-center rounded-full shadow-sm"
        style={{
          width: size,
          height: size,
          background: gradientFromSlug(slug), // ← soft gradient
          color: fg,
          border: `1px solid ${border}`,
          boxShadow:
            'inset 0 0 0 1px rgba(255,255,255,.65), 0 1px 2px rgba(0,0,0,.05)',
        }}
      >
        {useIcons ? (
          <Icon className={dense ? 'text-[18px]' : 'text-[20px]'} />
        ) : (
          <span className={`font-semibold ${font}`}>{initials(name)}</span>
        )}
      </span>

      <span className="text-[11px] leading-tight text-gray-800 text-center line-clamp-2">
        {name}
      </span>
    </>
  );

  const onFocus = (e: React.FocusEvent<HTMLElement>) => {
    (e.currentTarget.firstElementChild as HTMLElement).style.boxShadow =
      `0 0 0 4px ${ring}, inset 0 0 0 1px rgba(255,255,255,.65), 0 1px 2px rgba(0,0,0,.05)`;
  };
  const onBlur = (e: React.FocusEvent<HTMLElement>) => {
    (e.currentTarget.firstElementChild as HTMLElement).style.boxShadow =
      'inset 0 0 0 1px rgba(255,255,255,.65), 0 1px 2px rgba(0,0,0,.05)';
  };

  return href ? (
    <Link href={href} {...common} onFocus={onFocus} onBlur={onBlur}>
      {inner}
    </Link>
  ) : (
    <button type="button" {...common} onClick={onClick} onFocus={onFocus} onBlur={onBlur}>
      {inner}
    </button>
  );
}

/* ---------- exported grid ---------- */

export default function CategoryChips({ categories, onSelectSlug, dense, useIcons }: Props) {
  const list = useMemo(() => {
    const arr = Array.isArray(categories) ? categories : [];
    return [...arr].sort((a, b) => a.name.localeCompare(b.name));
  }, [categories]);

  if (!list.length) {
    return (
      <div className="mt-2 grid grid-cols-4 sm:grid-cols-6 gap-3">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="flex flex-col items-center gap-1.5">
            <span className="rounded-full bg-gray-100 animate-pulse" style={{ width: 60, height: 60 }} />
            <span className="w-14 h-3 rounded bg-gray-100 animate-pulse" />
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="mt-3 grid grid-cols-4 sm:grid-cols-6 gap-3">
      {list.map((c) => (
        <RoundBadge
          key={c.documentId || c.id}
          name={c.name}
          slug={c.slug}
          dense
          useIcons={false} // letters; set true to use icons
          {...(onSelectSlug
            ? { onClick: () => onSelectSlug(c.slug) }
            : { href: `/categories/${c.slug}` })}
        />
      ))}
    </div>
  );
}
