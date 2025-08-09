'use client';

import Link from 'next/link';
import { useMemo } from 'react';
import type { Category } from '@/app/home/actions/getCategories';

// FA (via react-icons)
import {
  FaPlane,
  FaTrain,
  FaGraduationCap,
  FaFilm,
  FaMobileAlt,
  FaTags,
  FaLandmark,
  FaShieldAlt,
  FaMicrochip,
  FaRoute,
  FaNewspaper,
  FaChartBar,
  FaRegFolder,
  FaCar
} from 'react-icons/fa';

type Props = {
  categories?: Category[];
  onSelectSlug?: (slug: string) => void; // optional intercept
  dense?: boolean;                        // compact spacing if needed
};

/** Stable HSL color from slug */
function hueFromSlug(slug: string) {
  let h = 0;
  for (let i = 0; i < slug.length; i++) h = (h * 31 + slug.charCodeAt(i)) >>> 0;
  return h % 360;
}

/** Map slug → icon (adjust freely as you add categories) */
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
  return FaRegFolder; // fallback
}

function Chip({
  name,
  slug,
  href,
  onClick,
  dense,
}: {
  name: string;
  slug: string;
  href?: string;
  onClick?: () => void;
  dense?: boolean;
}) {
  const hue = hueFromSlug(slug);
  const text = `hsl(${hue} 60% 22%)`;
  const bg = `hsl(${hue} 95% 92% / 0.92)`;
  const ring = `hsl(${hue} 70% 40% / 0.25)`;
  const badgeFg = `hsl(${hue} 70% 30%)`;
  const badgeBg = `hsl(${hue} 95% 98%)`;

  const Icon = iconForSlug(slug);

  const base =
    'inline-flex items-center gap-2 rounded-lg border border-white/70 shadow-sm ' +
    'backdrop-blur-[2px] transition hover:translate-y-[0.5px] hover:shadow ' +
    'focus:outline-none focus-visible:ring-2';

  const size = dense ? 'px-3 py-1 text-[13px]' : 'px-3.5 py-1.5 text-sm';

  const style = {
    color: text,
    backgroundColor: bg,
    boxShadow: 'inset 0 0 0 1px rgba(0,0,0,0.04)',
  } as React.CSSProperties;

  const badgeStyle = {
    color: badgeFg,
    backgroundColor: badgeBg,
    boxShadow: 'inset 0 0 0 1px rgba(0,0,0,0.06)',
  } as React.CSSProperties;

  const content = (
    <>
      <span
        className="grid place-items-center rounded-full w-5 h-5 shrink-0"
        style={badgeStyle}
        aria-hidden
      >
        {/* Don't set explicit color — inherits from badgeStyle */}
        <Icon className="text-[11px]" />
      </span>
      <span className="truncate">{name}</span>
    </>
  );

  const onFocus = (e: React.FocusEvent<HTMLElement>) => {
    e.currentTarget.style.boxShadow = `${style.boxShadow}, 0 0 0 4px ${ring}`;
  };
  const onBlur = (e: React.FocusEvent<HTMLElement>) => {
    e.currentTarget.style.boxShadow = style.boxShadow as string;
  };

  if (href) {
    return (
      <Link
        href={href}
        className={`${base} ${size}`}
        style={style}
        aria-label={name}
        title={name}
        onFocus={onFocus}
        onBlur={onBlur}
      >
        {content}
      </Link>
    );
  }

  return (
    <button
      type="button"
      onClick={onClick}
      className={`${base} ${size}`}
      style={style}
      aria-label={name}
      title={name}
      onFocus={onFocus}
      onBlur={onBlur}
    >
      {content}
    </button>
  );
}

export default function CategoryChips({ categories, onSelectSlug, dense }: Props) {
  const list = useMemo(() => {
    const arr = Array.isArray(categories) ? categories : [];
    return [...arr].sort((a, b) => a.name.localeCompare(b.name));
  }, [categories]);

  if (!list.length) {
    return (
      <div className="mt-3 flex flex-wrap gap-2">
        {Array.from({ length: 12 }).map((_, i) => (
          <div key={i} className="h-8 w-28 rounded-full bg-gray-100 animate-pulse" />
        ))}
      </div>
    );
  }

  return (
    <div className="mt-3 flex flex-wrap gap-2">
      {list.map((c) => (
        <Chip
          key={c.id}
          name={c.name}
          slug={c.slug}
          dense={dense}
          {...(onSelectSlug
            ? { onClick: () => onSelectSlug(c.slug) }
            : { href: `/categories/${c.slug}` })}
        />
      ))}
    </div>
  );
}
