// app/[year]/[month]/[day]/_components/DateSheet.tsx
'use client';

import dynamic from 'next/dynamic';
import type { CalendarProps } from 'react-calendar';

// Prevent SSR for the calendar widget (avoids hydration quirks)
const Calendar = dynamic<CalendarProps>(() => import('react-calendar'), { ssr: false });

interface Props {
  selectedDate: Date;
  onChange: (date: Date) => void;
  onClose: () => void;
}

export default function DateSheet({ selectedDate, onChange, onClose }: Props) {
  return (
    <div className="fixed inset-0 z-40">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="absolute inset-x-0 bottom-0 bg-white rounded-t-2xl shadow-xl max-h-[80vh] overflow-y-auto p-4">
        <div className="mx-auto h-1 w-10 bg-gray-200 rounded-full mb-3" />
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-base font-semibold">Select Date</h3>
          <button className="rounded-full border px-3 py-1 text-sm" onClick={onClose}>Close</button>
        </div>

        <Calendar
          value={selectedDate}
          onChange={(v) => onChange(v as Date)}
          calendarType="iso8601"
          maxDate={new Date()}
          tileDisabled={({ date }) => date > new Date()}
          className="border-0 bg-transparent"
        />
      </div>
    </div>
  );
}
