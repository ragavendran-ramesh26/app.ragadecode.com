// app/home/page.tsx
import { getTimelineCounts } from './actions/getTimelineCounts';
import ClientHomePage from './ClientHomePage';

export default async function HomePage() {
  const today = new Date();
  const items = await getTimelineCounts(today); // server fetch
  return (
    <ClientHomePage
      todayISO={today.toISOString().slice(0,10)}
      items={items}
    />
  );
}
