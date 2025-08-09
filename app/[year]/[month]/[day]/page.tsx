import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { isValidMonthName } from '@app/utils/months';
import ClientView from './ClientView';
import { getTimelineCounts } from '@/app/home/actions/getTimelineCounts';

const BASE_URL = process.env.RAGA_API_BASE!;

type DateParams = { year: string; month: string; day: string };

function monthToIndex(m: string): number {
  const map: Record<string, number> = {
    january: 0, february: 1, march: 2, april: 3, may: 4, june: 5,
    july: 6, august: 7, september: 8, october: 9, november: 10, december: 11,
  };
  return map[m.toLowerCase()];
}

// --- SEO ---
export async function generateMetadata({
  params,
}: {
  params: Promise<DateParams>;
}): Promise<Metadata> {
  const { year, month, day } = await params;

  if (!isValidMonthName(month)) return notFound();

  const title = `Incidents for ${day} ${month} ${year}`;
  const description = `Daily incident report for ${day}-${month}-${year}`;

  return {
    title,
    description,
    alternates: { canonical: `/${year}/${month}/${day}` },
    openGraph: {
      title,
      description,
      type: 'article',
      publishedTime: new Date(`${year}-${month}-${day}`).toISOString(),
    },
  };
}

// --- PAGE ---
export default async function Page({ params }: { params: Promise<DateParams> }) {
  const { year, month, day } = await params;
  if (!isValidMonthName(month)) return notFound();

  // Build selected Date on the server
  const y = Number(year);
  const m = monthToIndex(month);
  const d = Number(day);
  if (Number.isNaN(y) || Number.isNaN(m) || Number.isNaN(d)) return notFound();
  const selectedDate = new Date(y, m, d);

  // Fetch incidents (existing)
  let incidentData: any = { data: [], meta: {} };
  try {
    const response = await fetch(`${BASE_URL}/incidents/${year}/${month}/${day}/`, {
      headers: { 'x-api-key': process.env.RAGA_API_KEY! },
      next: { revalidate: 60 },
    });
    const data = await response.json();

    if (data.detail === 'No incidents found for this date') {
      incidentData = { data: [], meta: {} };
    } else if (!response.ok) {
      throw new Error('API error');
    } else {
      incidentData = data;
    }
  } catch (error) {
    console.error('Error fetching incident data:', error);
    return notFound();
  }

  // ⬇️ NEW: fetch counts for SmartTimeline (±7, capped at today)
  const counts = await getTimelineCounts(selectedDate);

  return (
    <ClientView
      year={year}
      month={month}
      day={day}
      incidentData={incidentData}
      counts={counts}              // ⬅️ pass down
    />
  );
}
