'use client';

import { useCallback, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import Header from '@/app/[year]/[month]/[day]/_components/Header';
import DateHeader from '@/app/[year]/[month]/[day]/_components/DateHeader';
import BottomTabBar from '@/app/[year]/[month]/[day]/_components/BottomTabBar';
import DateSheet from '@/app/[year]/[month]/[day]/_components/DateSheet';
import CategorySheet from '@/app/[year]/[month]/[day]/_components/CategorySheet';
import SettingsSheet from '@/app/[year]/[month]/[day]/_components/SettingsSheet';
import SmartTimeline, { type TimelineItem } from './_components/SmartTimeline';
import { getMonthName, formatDay } from '@app/utils/months';

import CategoryChips from './_components/CategoryChips';
import type { Category } from './actions/getCategories';

import SwipeDeck from './_components/SwipeDeck';
import type { Article } from './actions/getArticlesByHashtag';

function fromISO(iso: string) {
    const [y, m, d] = iso.split('-').map(Number);
    return new Date(y, m - 1, d);
}

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
    decks?: Record<string, Article[]>;
    decksError?: string;
}) {
    const router = useRouter();
    const today = useMemo(() => fromISO(todayISO), [todayISO]);

    // Sheets & UI state (same pattern as incident page)
    const [mobileDateOpen, setMobileDateOpen] = useState(false);
    const [mobileCatsOpen, setMobileCatsOpen] = useState(false);
    const [settingsOpen, setSettingsOpen] = useState(false);

    const goToDate = useCallback((d: Date) => {
        const y = d.getFullYear();
        const m = getMonthName(d.getMonth());
        const dd = formatDay(d.getDate());
        router.push(`/${y}/${m}/${dd}`);
    }, [router]);

    const openCalendar = useCallback(() => setMobileDateOpen(true), []);
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

            {/* Main */}
            <main className="with-fixed-header px-3 sm:px-4 pb-24 bg-white">
                {/* Keep your familiar date title */}
                <DateHeader date={today.toLocaleDateString('en-GB', {
                    weekday: 'long', day: 'numeric', month: 'short', year: 'numeric',
                })} />

                {/* Smart Timeline */}
                <div className="mt-3">
                    <SmartTimeline
                        selectedDate={today}
                        counts={items}           // optional; shows tiny count chips
                        daysBefore={7}
                        daysAfter={7}
                        onPick={goToDate}
                    />
                </div>

                {/* You can add more home modules below… */}
                <div className="mt-6 text-sm text-gray-500">
                    <div className="pt-2">
                        <h1 className="text-xl font-bold">Explore by Category</h1>

                    </div>

                    {/* Categories Grid */}
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


            </main>

            {/* Bottom tabs (same as incident page) */}
            <BottomTabBar
                goHomeToday={goHomeToday}
                openDate={() => setMobileDateOpen(true)}
                openCats={() => setMobileCatsOpen(true)}
                openSettings={() => setSettingsOpen(true)}
            />

            {/* Sheets */}
            {mobileDateOpen && (
                <DateSheet
                    selectedDate={today}
                    onChange={handleDateChange}
                    onClose={() => setMobileDateOpen(false)}
                />
            )}

            {mobileCatsOpen && (
                <CategorySheet
                    categories={[]}
                    activeTag={null}
                    onSelectTag={() => { }}
                    onClose={() => setMobileCatsOpen(false)}
                />
            )}

            {settingsOpen && (
                <SettingsSheet onClose={() => setSettingsOpen(false)} />
            )}
        </div>
    );
}
