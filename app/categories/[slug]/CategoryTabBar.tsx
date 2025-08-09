'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import BottomTabBar from '@/app/[year]/[month]/[day]/_components/BottomTabBar';
import DateSheet from '@/app/[year]/[month]/[day]/_components/DateSheet';
import SettingsSheet from '@/app/[year]/[month]/[day]/_components/SettingsSheet';

function pathFromDate(d: Date) {
  const y = d.getFullYear();
  const m = d.toLocaleString('en-US', { month: 'long' }).toLowerCase();
  const day = String(d.getDate()).padStart(2, '0');
  return `/${y}/${m}/${day}`;
}

export default function CategoryTabBar() {
  const router = useRouter();

  const [openCalendar, setOpenCalendar] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());

  const [openSettings, setOpenSettings] = useState(false);

  return (
    <>
      <BottomTabBar
        goHome={() => router.push('/home')}
        openDate={() => setOpenCalendar(true)}          // open DateSheet
        openCats={() => router.push('/categories')}     // or your preferred filter route
        openSettings={() => setOpenSettings(true)}      // ✅ open SettingsSheet
      />

      {openCalendar && (
        <DateSheet
          selectedDate={selectedDate}
          onClose={() => setOpenCalendar(false)}
          onChange={(d) => {
            setSelectedDate(d);
            setOpenCalendar(false);
            router.push(pathFromDate(d));
          }}
        />
      )}

      {openSettings && (
        // If your SettingsSheet accepts different props, adjust below accordingly
        <SettingsSheet onClose={() => setOpenSettings(false)} />
      )}
    </>
  );
}
