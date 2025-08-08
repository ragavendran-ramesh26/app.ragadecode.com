// app/utils/months.ts
type MonthName =
    | 'january' | 'february' | 'march' | 'april'
    | 'may' | 'june' | 'july' | 'august'
    | 'september' | 'october' | 'november' | 'december';

const monthNames: MonthName[] = [
    'january', 'february', 'march', 'april',
    'may', 'june', 'july', 'august',
    'september', 'october', 'november', 'december'
];

// Convert month index (0-11) to month name
export const getMonthName = (monthIndex: number): MonthName => {
    if (monthIndex < 0 || monthIndex > 11) {
        throw new Error('Invalid month index');
    }
    return monthNames[monthIndex];
};

// Convert month name to month index (0-11)
export const getMonthIndex = (monthName: string): number => {
    const index = monthNames.indexOf(monthName.toLowerCase() as MonthName);
    if (index === -1) {
        throw new Error('Invalid month name');
    }
    return index;
};

// Validate if string is a valid month name
export const isValidMonthName = (month: string): month is MonthName => {
    return monthNames.includes(month.toLowerCase() as MonthName);
};

// Pad day with leading zero
export const formatDay = (day: number | string): string => {
    return String(day).padStart(2, '0');
};