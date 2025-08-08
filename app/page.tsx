// app/page.tsx (Server Component)
import { redirect } from "next/navigation";
import { getMonthName, formatDay } from "@app/utils/months";

export default function HomePage() {
  const now = new Date();
  const path = `/${now.getFullYear()}/${getMonthName(now.getMonth())}/${formatDay(now.getDate())}`;
  redirect(path);
}
