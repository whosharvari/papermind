/** "sentence-transformers/all-MiniLM-L6-v2" -> "all-MiniLM-L6-v2" */
export function shortModelName(fullName: string): string {
  const lastSegment = fullName.split("/").pop();
  return lastSegment && lastSegment.length > 0 ? lastSegment : fullName;
}

const RELATIVE_TIME_UNITS: [Intl.RelativeTimeFormatUnit, number][] = [
  ["year", 365 * 24 * 60 * 60 * 1000],
  ["month", 30 * 24 * 60 * 60 * 1000],
  ["day", 24 * 60 * 60 * 1000],
  ["hour", 60 * 60 * 1000],
  ["minute", 60 * 1000],
];

const relativeTimeFormatter = new Intl.RelativeTimeFormat("en", { numeric: "auto" });

/** Coarse relative timestamp for conversation list rows, e.g. "3h ago". */
export function formatRelativeTime(timestamp: number): string {
  const diff = timestamp - Date.now();
  for (const [unit, ms] of RELATIVE_TIME_UNITS) {
    if (Math.abs(diff) >= ms) {
      return relativeTimeFormatter.format(Math.round(diff / ms), unit);
    }
  }
  return "just now";
}
