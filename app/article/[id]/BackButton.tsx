'use client';

import { useRouter } from 'next/navigation';
import clsx from 'clsx';

type Props = {
  className?: string;
  icon?: boolean;         // <- use icon mode when true
  size?: number;          // <- optional, defaults to 44px
};

export default function BackButton({ className, icon = false, size = 44 }: Props) {
  const router = useRouter();
  const goBack = () => (history.length > 1 ? router.back() : router.push('/'));

  if (icon) {
    return (
      <button
        type="button"
        onClick={goBack}
        aria-label="Back"
        className={clsx(
          'grid place-items-center rounded-full shadow-md ring-1 ring-slate-100 bg-white',
          'text-slate-700 hover:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500',
          className
        )}
        style={{ width: size, height: size }}
      >
        <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true" fill="none">
          <path d="M15 19L8 12l7-7" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={goBack}
      className={clsx(
        'inline-flex items-center gap-2 rounded-full px-3 py-1 text-sm font-medium',
        'border shadow-sm text-gray-900 bg-white hover:bg-white',
        className
      )}
      aria-label="Go back"
    >
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <path d="M15 19L8 12l7-7" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
      <span>Back</span>
    </button>
  );
}
