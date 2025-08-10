'use client';

import { useCallback, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import Header from '@/app/[year]/[month]/[day]/_components/Header';
import DateHeader from '@/app/[year]/[month]/[day]/_components/DateHeader';
import BottomTabBar from '@/app/[year]/[month]/[day]/_components/BottomTabBar';
import DateSheet from '@/app/[year]/[month]/[day]/_components/DateSheet';
import SettingsSheet from '@/app/[year]/[month]/[day]/_components/SettingsSheet';
import SmartTimeline, { type TimelineItem } from './_components/SmartTimeline';
import { getMonthName, formatDay } from '@app/utils/months';
import IndiaChoropleth from './_components/IndiaChoropleth';
import CategoryChips from './_components/CategoryChips';
import type { Category } from './actions/getCategories';
import SwipeDeck from './_components/SwipeDeck';
import type { RawArticle } from './actions/getArticlesByHashtag';

/* ---------- utils ---------- */

function fromISO(iso: string) {
  const [y, m, d] = iso.split('-').map(Number);
  return new Date(y, m - 1, d);
}

function formatDateLabel(d: Date) {
  const weekdays = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'];
  const months   = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
  return `${weekdays[d.getDay()]} ${d.getDate()} ${months[d.getMonth()]} ${d.getFullYear()}`;
}

/* ---------- props ---------- */

type HeatDatum = {
  value: number;
  metrics: { murder: number; rape: number; accident: number; suicide: number };
  meta?: { href?: string; label?: string; slug?: string };
};

export default function ClientHomePage({
  todayISO,
  items,
  categories = [],
  categoriesError,
  decks = {},
  decksError,
  stateHeatmap = {}, // 🔥 from server via API
}: {
  todayISO: string;
  items: TimelineItem[];
  categories?: Category[];
  categoriesError?: string;
  decks?: Record<string, RawArticle[]>;
  decksError?: string;
  stateHeatmap?: Record<string, HeatDatum>; // key = state name matching GeoJSON
}) {
  const router = useRouter();
  const today = useMemo(() => fromISO(todayISO), [todayISO]);

  const [mobileDateOpen, setMobileDateOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);

  const goToDate = useCallback((d: Date) => {
    const y = d.getFullYear();
    const m = getMonthName(d.getMonth());
    const dd = formatDay(d.getDate());
    router.push(`/${y}/${m}/${dd}`);
  }, [router]);

  const handleDateChange = useCallback((d: Date) => {
    setMobileDateOpen(false);
    goToDate(d);
  }, [goToDate]);

  const goHomeToday = useCallback(() => goToDate(today), [goToDate, today]);

  // map mode: which metric to color by
  const [mode, setMode] = useState<'total'|'murder'|'rape'|'accident'|'suicide'>('total');

  // transform to the shape IndiaChoropleth expects: { [state]: { value, metrics, meta } }
  const mapData = useMemo(() => {
    const out: Record<string, { value: number; metrics: HeatDatum['metrics']; meta?: HeatDatum['meta'] }> = {};
    for (const [name, d] of Object.entries(stateHeatmap)) {
      out[name] = {
        value: mode === 'total' ? d.value : d.metrics[mode],
        metrics: d.metrics,
        meta: d.meta,
      };
    }
    return out;
  }, [stateHeatmap, mode]);

  return (
    <div
      className="min-h-screen bg-gray-50 flex flex-col w-full max-w-[900px] mx-auto"
      style={{ paddingTop: 'env(safe-area-inset-top)', paddingBottom: 'env(safe-area-inset-bottom)' }}
    >
      <Header />

      <main className="with-fixed-header px-3 sm:px-4 pb-24 bg-white">
        <DateHeader date={formatDateLabel(today)} />

        <div className="mt-3">
          <SmartTimeline
            selectedDate={today}
            counts={items}
            daysBefore={7}
            daysAfter={7}
            onPick={goToDate}
          />
        </div>

        <div className="mt-6 text-sm text-gray-500">
          <div className="pt-2">
            <h2 className="text-[17px] font-semibold sm:text-xl">Explore by Category</h2>
          </div>
          <CategoryChips categories={categories} />
        </div>

        {decksError ? (
          <div className="mt-4 rounded-xl border border-yellow-200 bg-yellow-50 p-3 text-sm text-yellow-800">
            {decksError}
          </div>
        ) : (
          <>
            <SwipeDeck title="Viral" rawArticles={decks['viral']} />
            <SwipeDeck title="Murder" rawArticles={decks['murder']} />
            <SwipeDeck title="Rape" rawArticles={decks['rape']} />
            <SwipeDeck title="Accident" rawArticles={decks['accident']} />
          </>
        )}

        {/* mode switch for the heatmap */}
        <div className="mt-6 flex gap-2 text-xs">
          {(['total','murder','rape','accident','suicide'] as const).map(m => (
            <button
              key={m}
              onClick={() => setMode(m)}
              className={`px-3 py-1 rounded-full border ${mode===m ? 'bg-gray-900 text-white' : 'bg-white'}`}
              aria-pressed={mode===m}
            >
              {m === 'total' ? 'All' : m[0].toUpperCase() + m.slice(1)}
            </button>
          ))}
        </div>

        <IndiaChoropleth
          data={mapData}
          title={`Incidents by State (${mode === 'total' ? 'All' : mode})`}
          legend="Count"
          onStateClick={(_, d) => {
            if (d?.meta?.href) window.location.href = d.meta.href;
          }}
        />
      </main>

      <BottomTabBar
        goHome={() => router.push('/home')} 
        openDate={() => setMobileDateOpen(true)}
        openCats={() => router.push('/categories')}
        openSettings={() => setSettingsOpen(true)}
      />

      {mobileDateOpen && (
        <DateSheet
          selectedDate={today}
          onChange={handleDateChange}
          onClose={() => setMobileDateOpen(false)}
        />
      )}

      {settingsOpen && <SettingsSheet onClose={() => setSettingsOpen(false)} />}
    </div>
  );
}
