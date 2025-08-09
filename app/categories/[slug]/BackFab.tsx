// app/categories/[slug]/BackFab.tsx
'use client';

import BackButton from '@/app/article/[id]/BackButton';

export default function BackFab() {
  return <BackButton icon size={40} className="fixed top-3 left-3 z-20 bg-white/95" />;
}
