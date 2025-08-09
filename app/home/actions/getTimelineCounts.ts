'use server';

export type CountRow = { dateISO: string; count: number };

/**
 * Fetch incident counts in a date range.
 * Replace the fetch URL with your backend endpoint.
 */
export async function getTimelineCounts(baseDate = new Date()): Promise<CountRow[]> {
  const start = new Date(baseDate);
  start.setDate(start.getDate() - 7);
  const end = new Date(baseDate);
  end.setDate(end.getDate() + 7);

  const toISO = (d: Date) => d.toISOString().slice(0, 10);

  // --- TODO: replace with your real API ---
  // Example: GET /api/incidents/counts?from=YYYY-MM-DD&to=YYYY-MM-DD
  try {
    const res = await fetch(
      `${process.env.RAGA_API_BASE}/incidents/counts?from=${toISO(start)}&to=${toISO(end)}`,
      { headers: { 'x-api-key': process.env.RAGA_API_KEY || '' }, cache: 'no-store' }
    );
    if (res.ok) {
      const data = await res.json(); // ensure it returns [{dateISO, count}]
      return data;
    }
  } catch {}
  // Fallback mock so UI works while wiring the API
  const out: CountRow[] = [];
  for (let i = -7; i <= 7; i++) {
    const d = new Date(baseDate);
    d.setDate(d.getDate() + i);
    out.push({ dateISO: d.toISOString().slice(0, 10), count: Math.max(0, (7 - Math.abs(i))) });
  }
  return out;
}
