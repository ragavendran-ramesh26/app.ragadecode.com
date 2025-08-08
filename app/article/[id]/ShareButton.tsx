'use client';

import clsx from 'clsx';

export default function ShareButton({
  title,
  text,
  url,          // pass a URL in; will fallback to window.location.href
  className,
}: {
  title: string;
  text?: string;
  url?: string;
  className?: string;
}) {
  const share = async () => {
    const fallback = typeof window !== 'undefined' ? window.location.href : '';
    const shareUrl = url || fallback;
    try {
      if (navigator.share) {
        await navigator.share({ title, text: text || title, url: shareUrl });
      } else {
        await navigator.clipboard.writeText(shareUrl);
        alert('Link copied');
      }
    } catch {/* user canceled */}
  };

  return (
    <button
      type="button"
      onClick={share}
      className={clsx(
        'inline-flex items-center gap-2 rounded-full px-3 py-1 text-sm font-medium',
        'border text-gray-900 bg-white/90 hover:bg-white shadow-sm',
        className
      )}
      aria-label="Share"
    >
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
        <path d="M4 12v7a1 1 0 0 0 1 1h14a1 1 0 0 0 1-1v-7" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"/>
        <path d="M12 4v12M12 4l4 4M12 4 8 8" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
      Share
    </button>
  );
}
