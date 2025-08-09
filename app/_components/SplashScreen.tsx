'use client';

import { useEffect, useState } from 'react';

export default function SplashScreen({
  minDuration = 1200,
  hideWhenReady = true,
  ready = true,
  maxDuration = 8000,
}: {
  minDuration?: number;
  hideWhenReady?: boolean;
  ready?: boolean;
  maxDuration?: number;
}) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const seenKey = 'rd.splash.dismissed';
    if (sessionStorage.getItem(seenKey)) return;

    setVisible(true);
    const start = Date.now();

    const done = () => {
      const elapsed = Date.now() - start;
      const wait = Math.max(0, minDuration - elapsed);
      setTimeout(() => {
        setVisible(false);
        sessionStorage.setItem(seenKey, '1');
      }, wait);
    };

    let maxTimer: any;
    if (hideWhenReady) {
      maxTimer = setTimeout(done, maxDuration);
      const t = setInterval(() => {
        if (ready) {
          clearInterval(t);
          done();
        }
      }, 50);
      return () => clearInterval(t);
    } else {
      done();
    }
  }, [minDuration, hideWhenReady, ready, maxDuration]);

  if (!visible) return null;

  return (
    <div className="fixed inset-0 z-[1000] flex items-center justify-center bg-white">
      <div className="flex flex-col items-center">
        <img
          src="https://genuine-compassion-eb21be0109.media.strapiapp.com/ragadecode_logo_668c5f78f9.png"
          alt="Raga Decode"
          className="h-24 w-auto animate-pulse"
        />
        <p className="mt-3 text-xs text-gray-500 tracking-wide">
          Decoded News. Clear. Bold. Unfiltered.
        </p>
      </div>
    </div>
  );
}
