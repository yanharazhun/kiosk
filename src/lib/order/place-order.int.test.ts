import { beforeAll, describe, expect, it, onTestFinished } from "vitest";
import { db } from "@/lib/db";
import { subscribe } from "@/lib/events/bus";
import type { MenuProduct } from "@/lib/menu/types";
import { groupOf, optionOf, seededClassic } from "@/test/seeded-menu";
import { placeOrder } from "./place-order";

let burger: MenuProduct;
let meal: MenuProduct;

beforeAll(async () => {
  ({ burger, meal } = await seededClassic());
});

function mealPicks(overrides: Record<string, Record<string, number>> = {}) {
  return {
    [groupOf(meal, "Choose a drink").id]: { [optionOf(groupOf(meal, "Choose a drink"), "Cola").productId]: 1 },
    [groupOf(meal, "Choose a side").id]: { [optionOf(groupOf(meal, "Choose a side"), "Fries").productId]: 1 },
    ...overrides,
  };
}

function order(items: object[], paymentMethod: "CARD" | "COUNTER" = "COUNTER") {
  return { serviceType: "EAT_IN", paymentMethod, locale: "en", items };
}

function line(overrides: object = {}) {
  return { id: "line-1", productId: burger.id, isMeal: false, picks: {}, quantity: 1, ...overrides };
}

describe("placeOrder", () => {
  it("prices the order on the server from the database menu", async () => {
    const extras = groupOf(meal, "Extras");
    const cheese = optionOf(extras, "Cheese");
    const result = await placeOrder(
      order([line({ isMeal: true, picks: mealPicks({ [extras.id]: { [cheese.productId]: 2 } }), quantity: 3 })]),
    );

    expect(result).toMatchObject({
      ok: true,
      order: { number: 1, totalMinor: (meal.priceMinor + 2 * cheese.priceDeltaMinor) * 3 },
    });
  });

  it("ignores any price the client sends", async () => {
    const result = await placeOrder({
      ...order([{ ...line(), priceMinor: 1, unitPriceMinor: 1 }]),
      totalMinor: 1,
    });

    expect(result).toMatchObject({ ok: true, order: { totalMinor: burger.priceMinor } });
  });

  it("keeps a snapshot of names and prices when the menu changes later", async () => {
    const result = await placeOrder(order([line()]));
    if (!result.ok) throw new Error("order was not placed");

    await db.product.update({ where: { id: burger.id }, data: { priceMinor: 1, name: { en: "Renamed" } } });
    onTestFinished(async () => {
      await db.product.update({
        where: { id: burger.id },
        data: { priceMinor: burger.priceMinor, name: burger.name },
      });
    });

    const item = await db.orderItem.findFirstOrThrow({ where: { orderId: result.order.id } });
    expect(item).toMatchObject({
      productName: burger.name,
      basePriceMinor: burger.priceMinor,
      unitPriceMinor: burger.priceMinor,
    });
  });

  it("rejects a product that is sold out", async () => {
    await db.product.update({ where: { id: burger.id }, data: { isAvailable: false } });

    expect(await placeOrder(order([line()]))).toEqual({ ok: false, reason: "unavailable" });
  });

  it("rejects a meal without its required drink", async () => {
    const picks = mealPicks();
    delete picks[groupOf(meal, "Choose a drink").id];

    expect(await placeOrder(order([line({ isMeal: true, picks })]))).toEqual({
      ok: false,
      reason: "unavailable",
    });
  });

  it("rejects more of an option than it allows", async () => {
    const extras = groupOf(burger, "Extras");
    const cheese = optionOf(extras, "Cheese");
    const picks = { [extras.id]: { [cheese.productId]: cheese.maxQuantity + 1 } };

    expect(await placeOrder(order([line({ picks })]))).toEqual({ ok: false, reason: "unavailable" });
  });

  it("rejects an option that belongs to another group", async () => {
    const extras = groupOf(burger, "Extras");
    const onion = optionOf(groupOf(burger, "Remove"), "Onion");
    const picks = { [extras.id]: { [onion.productId]: 1 } };

    expect(await placeOrder(order([line({ picks })]))).toEqual({ ok: false, reason: "unavailable" });
  });

  it("rejects meal groups on a burger ordered on its own", async () => {
    expect(await placeOrder(order([line({ picks: mealPicks() })]))).toEqual({
      ok: false,
      reason: "unavailable",
    });
  });

  it.each([
    ["an empty cart", () => order([])],
    ["a zero quantity", () => order([line({ quantity: 0 })])],
    ["an unknown payment method", () => ({ ...order([line()]), paymentMethod: "CASH" })],
  ])("rejects %s as invalid input", async (_label, input) => {
    expect(await placeOrder(input())).toEqual({ ok: false, reason: "invalid" });
  });

  it("gives orders placed at the same moment distinct numbers", async () => {
    const results = await Promise.all(Array.from({ length: 10 }, () => placeOrder(order([line()]))));
    const numbers = results.map((result) => (result.ok ? result.order.number : null));

    expect(numbers.toSorted((a, b) => (a ?? 0) - (b ?? 0))).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9, 10]);
  });

  it("tells staff screens about counter orders only", async () => {
    const events: string[] = [];
    onTestFinished(subscribe((event) => events.push(event)));

    await placeOrder(order([line()], "CARD"));
    expect(events).toEqual([]);

    await placeOrder(order([line()], "COUNTER"));
    expect(events).toEqual(["orders-changed"]);
  });
});
