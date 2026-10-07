import { describe, expect, it } from "vitest";
import type { OrderStatus } from "@/generated/prisma/enums";
import { canStaffTransition, staffTransitions } from "./transitions";

describe("staffTransitions", () => {
  it.each<[OrderStatus, string[]]>([
    ["PENDING_PAYMENT", ["PAID", "CANCELLED"]],
    ["PAID", ["PREPARING"]],
    ["PREPARING", ["READY"]],
    ["READY", ["COMPLETED"]],
    ["COMPLETED", []],
    ["CANCELLED", []],
  ])("a counter order in %s can move to %j", (status, expected) => {
    expect(staffTransitions(status, "COUNTER")).toEqual(expected);
  });

  it("gives staff no actions on a card order waiting for the terminal", () => {
    expect(staffTransitions("PENDING_PAYMENT", "CARD")).toEqual([]);
  });

  it("treats a paid card order like any other paid order", () => {
    expect(staffTransitions("PAID", "CARD")).toEqual(["PREPARING"]);
  });
});

describe("canStaffTransition", () => {
  it.each<[OrderStatus, "PAID" | "PREPARING" | "READY" | "COMPLETED" | "CANCELLED"]>([
    ["PREPARING", "PAID"],
    ["READY", "PREPARING"],
    ["PAID", "READY"],
    ["PAID", "CANCELLED"],
    ["COMPLETED", "CANCELLED"],
    ["CANCELLED", "PAID"],
  ])("refuses %s → %s", (from, to) => {
    expect(canStaffTransition(from, to, "COUNTER")).toBe(false);
  });

  it("refuses to mark a card order as paid by hand", () => {
    expect(canStaffTransition("PENDING_PAYMENT", "PAID", "CARD")).toBe(false);
  });

  it("allows taking payment at the counter", () => {
    expect(canStaffTransition("PENDING_PAYMENT", "PAID", "COUNTER")).toBe(true);
  });
});
