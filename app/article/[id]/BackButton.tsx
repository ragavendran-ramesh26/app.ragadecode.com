'use client';

import { useRouter } from 'next/navigation';
import clsx from 'clsx';

export default function BackButton({ className }: { className?: string }) {
  const router = useRouter();
  return (
    <button
      type="button"
      onClick={() => (history.length > 1 ? router.back() : router.push('/'))}
      className={clsx(
        'inline-flex items-center gap-2 rounded-full px-3 py-1 text-sm font-medium',
        'border shadow-sm',
        className
      )}
      aria-label="Go back"
    >
      {/* chevron-left */}
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
        <path d="M15 19L8 12l7-7" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
      Back
    </button>
  );
}
