import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { isValidMonthName } from '@app/utils/months';
import ClientView from './ClientView';

const BASE_URL = process.env.RAGA_API_BASE!;

type DateParams = { year: string; month: string; day: string };

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
export default async function Page({
  params,
}: {
  params: Promise<DateParams>;
}) {
  const { year, month, day } = await params;

  if (!isValidMonthName(month)) return notFound();

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

  return <ClientView year={year} month={month} day={day} incidentData={incidentData} />;
}
