const TIME_ZONE = "Europe/Copenhagen";
const DAY_STARTS_AT_HOUR = 4;

const wallClock = new Intl.DateTimeFormat("en-CA", {
  timeZone: TIME_ZONE,
  year: "numeric",
  month: "numeric",
  day: "numeric",
  hour: "numeric",
  hourCycle: "h23",
});

/** The restaurant's business day (doc 16): an order at 00:30 still belongs to
 *  the previous day, because the day turns over at 04:00 Copenhagen time. */
export function businessDate(now = new Date()): Date {
  const parts = Object.fromEntries(
    wallClock.formatToParts(now).map((part) => [part.type, Number(part.value)]),
  );
  const date = new Date(Date.UTC(parts.year, parts.month - 1, parts.day));
  if (parts.hour < DAY_STARTS_AT_HOUR) date.setUTCDate(date.getUTCDate() - 1);
  return date;
}
