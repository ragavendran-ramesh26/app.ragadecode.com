"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { getMonthName, formatDay } from "@app/utils/months";

import Header from "./_components/Header";
import DateHeader from "./_components/DateHeader";
import TagPill from "./_components/TagPill";
import ArticleCard from "./_components/ArticleCard";
import BottomTabBar from '@/app/[year]/[month]/[day]/_components/BottomTabBar';
import DateSheet from "./_components/DateSheet";
import CategorySheet from "./_components/CategorySheet";
import SettingsSheet from "./_components/SettingsSheet";

import SmartTimeline from '@/app/home/_components/SmartTimeline';
import type { CountRow } from '@/app/home/actions/getTimelineCounts';
import type { IncidentData } from "./_types";
import { dateFromParamsUTC, useFormattedDate } from "./_hooks/useSafeDate";

type Props = {
  year: string;
  month: string;
  day: string;
  incidentData: IncidentData;
  counts: CountRow[];
};

export default function ClientIncidentPage({
  year,
  month,
  day,
  incidentData,
  counts
}: Props) {
  const router = useRouter();

  // ---- Date setup (Safari-safe)
  const initialDate = useMemo(
    () => dateFromParamsUTC(year, month, day) ?? new Date(),
    [year, month, day]
  );
  const [selectedDate, setSelectedDate] = useState<Date>(initialDate);
  const formattedDate = useFormattedDate(initialDate);

  // ---- UI state
  const [activeTag, setActiveTag] = useState<string | null>(null);
  const [mobileDateOpen, setMobileDateOpen] = useState(false);
  const [mobileCatsOpen, setMobileCatsOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);

  const goToDate = useCallback((d: Date) => {
    setSelectedDate(d);
    const y = d.getFullYear();
    const m = getMonthName(d.getMonth());
    const dd = formatDay(d.getDate());
    router.push(`/${y}/${m}/${dd}`);
  }, [router]);

  const openCalendar = useCallback(() => setMobileDateOpen(true), []);

  // optional PWA flag if you want it later
  const [isStandalone, setIsStandalone] = useState(false);

  useEffect(() => {
    const standalone =
      (window.matchMedia &&
        window.matchMedia("(display-mode: standalone)").matches) ||
      // @ts-ignore - iOS Safari PWA
      window.navigator.standalone === true;
    setIsStandalone(!!standalone);
  }, []);

  // ---- Handlers
  const handleDateChange = useCallback(
    (date: Date) => {
      setSelectedDate(date);
      const y = date.getFullYear();
      const m = getMonthName(date.getMonth());
      const d = formatDay(date.getDate());
      router.push(`/${y}/${m}/${d}`);
      setMobileDateOpen(false);
    },
    [router]
  );

  const goHomeToday = useCallback(() => {
    const now = new Date();
    const y = now.getFullYear();
    const m = getMonthName(now.getMonth());
    const d = formatDay(now.getDate());
    router.push(`/${y}/${m}/${d}`);
  }, [router]);

  return (
    <div
      className="min-h-screen bg-gray-50 flex flex-col w-full max-w-[900px] mx-auto"
      style={{
        paddingTop: "env(safe-area-inset-top)",
        paddingBottom: "env(safe-area-inset-bottom)",
      }}
    >
      <Header />

      {/* Main */}
      <main className="with-fixed-header px-3 sm:px-4 pb-24 bg-white">

        {/* SmartTimeline at top */}
        <div className="pt-2">
          <SmartTimeline
            selectedDate={selectedDate}
            counts={counts}
            daysBefore={7}
            daysAfter={7}            // component caps future to today
            onPick={goToDate}
          />
        </div>

        <DateHeader date={formattedDate} />

        {activeTag && (
          <div className="mb-4">
            <button
              onClick={() => setActiveTag(null)}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-100 text-blue-700 text-sm font-medium shadow-sm hover:bg-blue-200 active:scale-[.99]"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-4 w-4"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                  clipRule="evenodd"
                />
              </svg>
              Clear filter: <span className="font-semibold">{activeTag}</span>
            </button>
          </div>
        )}

        {incidentData.data.length === 0 ? (
  <div className="flex-1 flex items-center justify-center">
    <div className="text-center px-6">
      <img
        src="/empty-page.svg"
        alt="No news"
        className="mx-auto h-40 w-auto opacity-80"
      />
      <h2 className="text-lg font-semibold text-gray-900">
        No stories for {formattedDate}
      </h2>
      <p className="text-sm text-gray-500 mt-1">
        Try another date or adjust filters.
      </p>

      <div className="mt-6 flex items-center justify-center gap-3">
        <button
          onClick={openCalendar}
          className="rounded-full bg-blue-600 px-5 py-2 text-sm text-white hover:bg-blue-700 active:scale-[.99]"
        >
          Browse Calendar
        </button>
        <button
          onClick={goHomeToday}
          className="rounded-full border border-gray-300 px-5 py-2 text-sm text-gray-700 hover:bg-gray-50 active:scale-[.99]"
        >
          Jump to Today
        </button>
      </div>

       
    </div>
  </div>
) : (
          incidentData.data.map((category, i) => (
            <section key={`cat-${i}`} className="mb-6">
              <h3 className="text-red-600 font-semibold text-base mb-3">
                {category.category} ({category.article_count})
              </h3>

              {category.hashtags
                .filter((t) => !activeTag || t.hashtag === activeTag)
                .map((tag, j) => (
                  <div key={`tag-${j}`} className="mb-4">
                    <div className="mb-2">
                      <TagPill
                        hashtag={tag.hashtag}
                        active={activeTag === tag.hashtag}
                        onClick={() => setActiveTag(tag.hashtag)}
                      />
                    </div>

                    <ul className="space-y-3">
                      {tag.articles.map((article, k) => (
                        <ArticleCard key={`art-${k}`} article={article} />
                      ))}
                    </ul>
                  </div>
                ))}
            </section>
          ))
        )}
      </main>

      {/* Bottom tabs */}
      <BottomTabBar
        goHomeToday={goHomeToday}
        openDate={() => setMobileDateOpen(true)}
        openCats={() => setMobileCatsOpen(true)}
        openSettings={() => setSettingsOpen(true)}
      />

      {/* Sheets */}
      {mobileDateOpen && (
        <DateSheet
          selectedDate={selectedDate}
          onChange={handleDateChange}
          onClose={() => setMobileDateOpen(false)}
        />
      )}

      {mobileCatsOpen && (
        <CategorySheet
          categories={incidentData.data}
          activeTag={activeTag}
          onSelectTag={(t) => setActiveTag(t)}
          onClose={() => setMobileCatsOpen(false)}
        />
      )}

      {settingsOpen && <SettingsSheet onClose={() => setSettingsOpen(false)} />}

      {/* Optional: calendar look tweaks (used inside DateSheet) */}
      <style jsx global>{`
       /* Calendar theming tweaks */
.react-calendar {
  width: 100%;
  background: transparent;
  font-family: inherit;
  border: 0 !important;
}

.react-calendar__navigation button {
  border-radius: 8px;
}

.react-calendar__tile--now {
  background: #eef2ff !important; /* indigo-50 */
}

.react-calendar__tile--active {
  background: #6366f1 !important; /* indigo-500 */
  color: white !important;
}

      `}</style>
    </div>
  );
}
