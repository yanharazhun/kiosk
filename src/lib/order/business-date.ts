const TIME_ZONE = "Europe/Copenhagen";
const DAY_STARTS_AT_HOUR = 4;

/** The restaurant's business day (doc 16): an order at 00:30 still belongs to
 *  the previous day, because the day turns over at 04:00 Copenhagen time. */
export function businessDate(now = new Date()): Date {
  const shifted = new Date(now.getTime() - DAY_STARTS_AT_HOUR * 60 * 60 * 1000);
  // en-CA formats as YYYY-MM-DD
  const day = new Intl.DateTimeFormat("en-CA", {
    timeZone: TIME_ZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(shifted);
  return new Date(`${day}T00:00:00Z`);
}
