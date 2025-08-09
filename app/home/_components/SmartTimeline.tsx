// app/home/_components/SmartTimeline.tsx
'use client';

import clsx from 'clsx';
import { useEffect, useMemo, useRef } from 'react';

export type TimelineItem = { dateISO: string; count?: number };

// Make a key in LOCAL time, matching API "YYYY-MM-DD"
function toLocalKey(d: Date) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

export default function SmartTimeline({
  selectedDate,
  onPick,
  daysBefore = 7,
  daysAfter = 7,
  counts = [],
  className,
}: {
  selectedDate: Date;
  onPick: (d: Date) => void;
  daysBefore?: number;
  daysAfter?: number;
  counts?: TimelineItem[];
  className?: string;
}) {
  const toMid = (d: Date) => { const x = new Date(d); x.setHours(0,0,0,0); return x; };
  const today = useMemo(() => toMid(new Date()), []);
  const sel   = useMemo(() => toMid(selectedDate), [selectedDate]);

  // Window [start..end] (no future)
  const { start, end } = useMemo(() => {
    let s = new Date(sel); s.setDate(sel.getDate() - daysBefore);
    let e = new Date(sel); e.setDate(sel.getDate() + daysAfter);
    if (e > today) e = today;
    if (+sel === +today) { s = new Date(today); s.setDate(today.getDate() - daysBefore); e = today; }
    return { start: toMid(s), end: toMid(e) };
  }, [sel, daysBefore, daysAfter, today]);

  // Materialize days
  const days = useMemo(() => {
    const arr: Date[] = [];
    for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
      arr.push(new Date(d));
    }
    return arr;
  }, [start, end]);

  // Counts lookup indexed by API keys
  const countMap = useMemo(() => {
    const m = new Map<string, number>();
    for (const c of counts) if (c.dateISO) m.set(c.dateISO, c.count ?? 0);
    return m;
  }, [counts]);

  const scrollerRef = useRef<HTMLDivElement>(null);
  const isSameDay = (a: Date, b: Date) =>
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate();

  // Scroll selected into view (use local key!)
  useEffect(() => {
    const scroller = scrollerRef.current;
    if (!scroller) return;
    const key = toLocalKey(sel);
    const el = scroller.querySelector<HTMLButtonElement>(`[data-iso="${key}"]`);
    if (!el) return;
    const box = el.getBoundingClientRect();
    const parent = scroller.getBoundingClientRect();
    const offset = box.left - parent.left - parent.width/2 + box.width/2;
    scroller.scrollBy({ left: offset, behavior: 'smooth' });
  }, [sel]);

  return (
    <div className={clsx('w-full', className)}>
      <div ref={scrollerRef} className="flex gap-3 overflow-x-auto no-scrollbar px-1 pb-1 -mx-1">
        {days.map((d) => {
          const key = toLocalKey(d);                  // ✅ local key
          const isSel = isSameDay(d, sel);
          const wd = d.toLocaleDateString('en-GB', { weekday: 'short' });
          const day = d.getDate();
          const c = countMap.get(key) ?? 0;
          const disabled = d > today;                 // no future

          return (
            <button
              key={key}
              data-iso={key}
              onClick={() => !disabled && onPick(d)}
              disabled={disabled}
              aria-disabled={disabled}
              className="min-w-[48px] flex flex-col items-center focus:outline-none"
            >
              {/* Weekday */}
              <span className={clsx(
                'text-xs',
                isSel ? 'text-blue-600 font-semibold' : 'text-gray-500'
              )}>
                {wd}
              </span>

              {/* Small rounded-rectangle chip */}
              <span
                className={clsx(
                  'mt-1 inline-flex items-center justify-center h-7 px-2.5 rounded-lg',
                  'text-sm font-semibold transition border',
                  disabled && !isSel
                    ? 'border-gray-200 text-gray-300'
                    : isSel
                      ? 'border-blue-500 text-blue-600 bg-blue-50'
                      : 'border-gray-300 text-gray-900 hover:bg-gray-100'
                )}
              >
                {day}
              </span>

              {/* Optional count */}
              {c > 0 && (
                <span className="mt-1 text-[10px] px-1.5 py-0.5 rounded-full bg-blue-50 text-blue-700">
                  {c}
                </span>
              )}
            </button>
          );
        })}
      </div>

      <style jsx global>{`
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>
    </div>
  );
}
