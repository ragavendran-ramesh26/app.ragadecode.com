// app/_components/AppChrome.tsx
'use client';

import { useEffect, useMemo, useState } from 'react';
import BottomTabBar from '@/app/[year]/[month]/[day]/_components/BottomTabBar';
import MapSheet, { type StatsMap } from './MapSheet';

const demoStats: StatsMap = {
  'Tamil Nadu':   { accidents: 15, murder: 10, rape: 3, total: 28 },
  'Karnataka':    { accidents: 7,  murder: 5,  rape: 1, total: 13 },
  'Maharashtra':  { accidents: 22, murder: 14, rape: 6, total: 42 },
  'Kerala':       { accidents: 9,  murder: 2,  rape: 1, total: 12 },
  'Gujarat':      { accidents: 12, murder: 6,  rape: 2, total: 20 },
};

export default function AppChrome({ children }: { children: React.ReactNode }) {
  const [mapOpen, setMapOpen] = useState(false);
  const [stats, setStats] = useState<StatsMap>(demoStats);

  // Replace with your real API
  useEffect(() => {
    // Example: GET /api/incidents/summary?country=india
    // fetch('/api/incidents/summary?country=india')
    //   .then(r => r.json())
    //   .then(data => setStats(data.stats))
    //   .catch(() => {});
  }, []);

  return (
    <>
      <div className="min-h-[100dvh] pb-14">{children}</div>

      <BottomTabBar
        goHomeToday={() => window.location.assign('/')}
        openDate={() => {/* open your calendar UI */}}
        openCats={() => {/* open your filter UI */}}
        openSettings={() => {/* open settings */}}
        // openMap={() => setMapOpen(true)}
      />

      {/* <MapSheet open={mapOpen} onClose={() => setMapOpen(false)} stats={stats} /> */}
    </>
  );
}
