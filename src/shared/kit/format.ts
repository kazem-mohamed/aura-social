const compact = new Intl.NumberFormat("en", { notation: "compact", maximumFractionDigits: 1 });
const standard = new Intl.NumberFormat("en");

/** Counts under 10,000 print in full ("1,204"); larger ones compact ("12.4K"). */
export function formatCount(value: number): string {
  return value >= 10_000 ? compact.format(value) : standard.format(value);
}
