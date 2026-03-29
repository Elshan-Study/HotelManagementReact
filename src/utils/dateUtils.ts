// Склонение "ночь/ночи/ночей"
export function pluralNights(n: number): string {
    if (n % 10 === 1 && n % 100 !== 11) return `${n} ночь`;
    if ([2, 3, 4].includes(n % 10) && ![12, 13, 14].includes(n % 100)) return `${n} ночи`;
    return `${n} ночей`;
}

// "12 января 2025"
export function formatDateLong(iso: string): string {
    return new Date(iso).toLocaleDateString("ru-RU", {
        day: "numeric",
        month: "long",
        year: "numeric",
    });
}

// "12 янв."
export function formatDateShort(iso: string): string {
    return new Date(iso).toLocaleDateString("ru-RU", {
        day: "numeric",
        month: "short",
    });
}

export const breakLongWords = (text: string, maxLen = 15): string =>
    text.split(" ").map((word) =>
        word.length > maxLen
            ? word.match(new RegExp(`.{1,${maxLen}}`, "g"))?.join("\u200B") ?? word
            : word
    ).join(" ");

// "YYYY-MM-DD" от Date
export function toISODate(date: Date): string {
    return date.toISOString().split("T")[0];
}

// Сегодня и завтра в формате "YYYY-MM-DD"
export function getTodayAndTomorrow(): { today: string; tomorrow: string } {
    const now = new Date();
    const next = new Date(now);
    next.setDate(next.getDate() + 1);
    return { today: toISODate(now), tomorrow: toISODate(next) };
}

// Кол-во ночей между двумя датами-строками
export function nightsBetween(checkIn: string, checkOut: string): number {
    if (!checkIn || !checkOut) return 0;
    return Math.round(
        (new Date(checkOut).getTime() - new Date(checkIn).getTime()) / 86_400_000
    );
}

// Следующий день от строки "YYYY-MM-DD"
export function nextDay(isoDate: string): string {
    const d = new Date(isoDate);
    d.setDate(d.getDate() + 1);
    return toISODate(d);
}
