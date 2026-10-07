import { describe, expect, it } from "vitest";
import { businessDate } from "./business-date";

function dayOf(utc: string): string {
  return businessDate(new Date(utc)).toISOString().slice(0, 10);
}

describe("businessDate", () => {
  it.each([
    ["2026-01-15T02:59:00Z", "2026-01-14", "03:59 winter time"],
    ["2026-01-15T03:00:00Z", "2026-01-15", "04:00 winter time"],
    ["2026-07-15T01:59:00Z", "2026-07-14", "03:59 summer time"],
    ["2026-07-15T02:00:00Z", "2026-07-15", "04:00 summer time"],
    ["2026-01-14T23:30:00Z", "2026-01-14", "00:30 after midnight"],
    ["2026-01-15T22:59:00Z", "2026-01-15", "23:59 late evening"],
    ["2027-01-01T02:00:00Z", "2026-12-31", "03:00 on New Year's night"],
  ])("%s is business day %s (%s in Copenhagen)", (now, expected) => {
    expect(dayOf(now)).toBe(expected);
  });

  describe("on the night clocks go forward (29 March 2026, 02:00 → 03:00)", () => {
    it.each([
      ["2026-03-29T01:30:00Z", "2026-03-28", "03:30"],
      ["2026-03-29T02:00:00Z", "2026-03-29", "04:00"],
      ["2026-03-29T02:30:00Z", "2026-03-29", "04:30"],
    ])("%s is business day %s (%s in Copenhagen)", (now, expected) => {
      expect(dayOf(now)).toBe(expected);
    });
  });

  describe("on the night clocks go back (25 October 2026, 03:00 → 02:00)", () => {
    it.each([
      ["2026-10-25T02:00:00Z", "2026-10-24", "03:00"],
      ["2026-10-25T02:30:00Z", "2026-10-24", "03:30"],
      ["2026-10-25T03:00:00Z", "2026-10-25", "04:00"],
    ])("%s is business day %s (%s in Copenhagen)", (now, expected) => {
      expect(dayOf(now)).toBe(expected);
    });
  });

  it("returns midnight UTC of that day, ready for a DATE column", () => {
    expect(businessDate(new Date("2026-01-15T12:00:00Z")).toISOString()).toBe(
      "2026-01-15T00:00:00.000Z",
    );
  });
});
