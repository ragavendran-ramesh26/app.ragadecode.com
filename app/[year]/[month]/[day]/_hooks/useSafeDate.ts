import { useMemo } from "react";

const MONTHS = [
  "january","february","march","april","may","june",
  "july","august","september","october","november","december"
];

export function dateFromParamsUTC(y: string, mName: string, d: string) {
  const mi = MONTHS.indexOf(mName.toLowerCase());
  if (mi < 0) return null;
  return new Date(Date.UTC(Number(y), mi, Number(d)));
}

export function useFormattedDate(date: Date) {
  return useMemo(() => {
    const formatter = new Intl.DateTimeFormat("en-GB", {
      weekday: "long",
      day: "numeric",
      month: "short",
      year: "numeric",
      timeZone: "UTC",
    });
    return formatter.format(date);
  }, [date]);
}
