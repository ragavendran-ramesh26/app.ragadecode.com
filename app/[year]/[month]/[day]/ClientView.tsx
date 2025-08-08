// app/[year]/[month]/[day]/ClientView.tsx
'use client';

import dynamic from 'next/dynamic';

const IncidentPage = dynamic(() => import('./IncidentPage'), {
    ssr: false,
    loading: () => (
        <div className="p-4 text-center text-gray-500">Loading incidents...</div>
    ),
});

export default function ClientView(props: any) {
    return <IncidentPage {...props} />;
}