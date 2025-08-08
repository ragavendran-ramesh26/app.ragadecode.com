// app/[year]/[month]/[day]/_components/SettingsSheet.tsx
'use client';

import Link from 'next/link';

export default function SettingsSheet({ onClose }: { onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-40">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="absolute inset-x-0 bottom-0 bg-white rounded-t-2xl shadow-xl max-h-[70vh] overflow-y-auto p-4">
        <div className="mx-auto h-1 w-10 bg-gray-200 rounded-full mb-3" />
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-base font-semibold">Settings</h3>
          <button className="rounded-full border px-3 py-1 text-sm" onClick={onClose}>Close</button>
        </div>

        <ul className="divide-y">
          <li>
            <Link href="/about/author" className="flex items-center justify-between py-3">
              <span>About Author</span><span className="text-gray-400">›</span>
            </Link>
          </li>
          <li>
            <Link href="/static-pages/privacy-policy" className="flex items-center justify-between py-3">
              <span>Privacy Policy</span><span className="text-gray-400">›</span>
            </Link>
          </li>
          <li>
            <Link href="/static-pages/terms-and-conditions" className="flex items-center justify-between py-3">
              <span>Terms of Use</span><span className="text-gray-400">›</span>
            </Link>
          </li>
          <li>
            <Link href="/static-pages/contact-us" className="flex items-center justify-between py-3">
              <span>Contact</span><span className="text-gray-400">›</span>
            </Link>
          </li>
          <li>
            <Link href="/static-pages/grievance-redressal" className="flex items-center justify-between py-3">
              <span>Grievance Redressal</span><span className="text-gray-400">›</span>
            </Link>
          </li>
          <li>
            <Link href="/static-pages/compliance-reports" className="flex items-center justify-between py-3">
              <span>Compliance Reports</span><span className="text-gray-400">›</span>
            </Link>
          </li>
          <li className="py-3 text-xs text-gray-500">App v1.0.0</li>
        </ul>
      </div>
    </div>
  );
}
