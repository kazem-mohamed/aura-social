function toDate(value: unknown): Date | null {
  if (value instanceof Date) {
    return Number.isNaN(value.getTime()) ? null : new Date(value.getTime());
  }

  if (!value || (typeof value !== "string" && typeof value !== "number")) return null;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
}

/**
 * Parses the machine value emitted by a native date input without relying on
 * `new Date("YYYY-MM-DD")`, whose UTC interpretation can move the calendar
 * day in time zones west of Greenwich.
 */
export function parseDateInput(value: string): Date | null {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);
  if (!match) return null;

  const [, yearValue, monthValue, dayValue] = match;
  const year = Number(yearValue);
  const month = Number(monthValue);
  const day = Number(dayValue);
  const date = new Date(year, month - 1, day);

  return date.getFullYear() === year && date.getMonth() === month - 1 && date.getDate() === day
    ? date
    : null;
}

/** The latest calendar date permitted for a person who must be `age` or older. */
export function latestDateForMinimumAge(age: number, referenceDate = new Date()): string {
  const cutoff = new Date(
    referenceDate.getFullYear() - age,
    referenceDate.getMonth(),
    referenceDate.getDate(),
  );
  return toIsoDateOnly(cutoff);
}

/** Calendar-accurate age check; unlike a year subtraction it respects birthdays. */
export function isAtLeastAge(value: Date, age: number, referenceDate = new Date()): boolean {
  return toIsoDateOnly(value) <= latestDateForMinimumAge(age, referenceDate);
}

const MINUTE = 60 * 1000;
const HOUR = 60 * MINUTE;
const DAY = 24 * HOUR;

/** Compact age used on post cards: `5m`, `3h`, `2d`. */
export function formatRelativeShort(value: unknown): string {
  const date = toDate(value);
  if (!date) return "now";

  const elapsed = Date.now() - date.getTime();
  if (elapsed < HOUR) return `${Math.max(1, Math.floor(elapsed / MINUTE))}m`;
  if (elapsed < DAY) return `${Math.max(1, Math.floor(elapsed / HOUR))}h`;
  return `${Math.max(1, Math.floor(elapsed / DAY))}d`;
}

/**
 * Comment age: compact under a day, then an absolute short date. Kept distinct
 * from {@link formatRelativeShort} because comment threads have always shown
 * the absolute date past 24 hours.
 */
export function formatCommentTime(value: unknown): string {
  const date = toDate(value);
  if (!date) return "now";

  const elapsed = Date.now() - date.getTime();
  if (elapsed < HOUR) return `${Math.max(1, Math.floor(elapsed / MINUTE))}m`;
  if (elapsed < DAY) return `${Math.max(1, Math.floor(elapsed / HOUR))}h`;

  return date.toLocaleString(undefined, {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

/** Full timestamp used in tooltips. */
export function formatDateTime(value: unknown): string {
  const date = toDate(value);
  return date ? date.toLocaleString() : "Unknown date";
}

/** Short absolute date shown under profile posts. */
export function formatPostDate(value: unknown): string {
  const date = toDate(value);
  if (!date) return "Unknown date";

  return date.toLocaleString("en-US", {
    month: "short",
    day: "2-digit",
    hour: "numeric",
    minute: "2-digit",
  });
}

/** `YYYY-MM-DD`, the shape the signup endpoint expects. */
export function toIsoDateOnly(value: unknown): string {
  if (typeof value === "string") return parseDateInput(value) ? value : "";

  const date = toDate(value);
  if (!date) return "";

  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${date.getFullYear()}-${month}-${day}`;
}
