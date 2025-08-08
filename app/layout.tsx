// app/layout.tsx
import 'react-calendar/dist/Calendar.css';
import './globals.css';
import type { Metadata, Viewport } from 'next';
import SplashScreen from './_components/SplashScreen';


export const metadata: Metadata = {
  title: 'Raga Decode',
  description: 'Decoded News. Clear. Bold. Unfiltered.',
  manifest: '/manifest.webmanifest',
  icons: {
    icon: '/icons/icon-192.png',
    apple: '/icons/icon-192.png',
  },
};

export const viewport: Viewport = {
  themeColor: '#ffffff',
  viewportFit: 'cover',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        {/* PWA / iOS */}
        <meta name="application-name" content="RagaDecode" />
        <meta name="apple-mobile-web-app-title" content="RagaDecode" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        {/* optional: add explicit manifest link if you want */}
        <link rel="manifest" href="/manifest.webmanifest" />
        <link rel="apple-touch-icon" href="/icons/apple-touch-icon-180.png" />

      </head>
      <body className="bg-white text-gray-900">
        <SplashScreen minDuration={3000} hideWhenReady={true} />
        {children}
      </body>
    </html>
  );
}
