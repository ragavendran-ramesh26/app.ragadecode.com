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
import IndiaChoropleth, { type StateDatum } from './_components/IndiaChoropleth';
import CategoryChips from './_components/CategoryChips';
import type { Category } from './actions/getCategories';
import SwipeDeck from './_components/SwipeDeck';
import type { RawArticle } from './actions/getArticlesByHashtag';

function fromISO(iso: string) {
  const [y, m, d] = iso.split('-').map(Number);
  return new Date(y, m - 1, d);
}

// deterministic date label to avoid SSR/client differences
function formatDateLabel(d: Date) {
  const weekdays = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'];
  const months   = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
  return `${weekdays[d.getDay()]} ${d.getDate()} ${months[d.getMonth()]} ${d.getFullYear()}`;
}

const stateCounts: Record<string, StateDatum> = {
  'Tamil Nadu': { value: 12, meta: { href: '/locations/india/tamilnadu' } },
  Maharashtra:  { value: 9,  meta: { href: '/locations/india/maharashtra' } },
  Karnataka:    { value: 6 },
  'Uttar Pradesh': { value: 5 },
  Kerala:       { value: 4 },
};

export default function ClientHomePage({
  todayISO,
  items,
  categories = [],
  categoriesError,
  decks = {},
  decksError,
}: {
  todayISO: string;
  items: TimelineItem[];
  categories?: Category[];
  categoriesError?: string;
  decks?: Record<string, RawArticle[]>;
  decksError?: string;
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

  return (
    <div
      className="min-h-screen bg-gray-50 flex flex-col w-full max-w-[900px] mx-auto"
      style={{
        paddingTop: 'env(safe-area-inset-top)',
        paddingBottom: 'env(safe-area-inset-bottom)',
      }}
    >
      <Header />

      <main className="with-fixed-header px-3 sm:px-4 pb-24 bg-white">
        {/* deterministic label prevents hydration mismatch */}
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

        <IndiaChoropleth
          data={stateCounts}
          title="Incidents by State (Last 7 Days)"
          legend="Total"
          onStateClick={(state) => {
            // router.push(`/locations/india/${slugify(state)}`);
            console.log('Clicked:', state);
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

      {settingsOpen && (
        <SettingsSheet onClose={() => setSettingsOpen(false)} />
      )}
    </div>
  );
}
