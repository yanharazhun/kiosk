import { beforeEach, describe, expect, it } from "vitest";
import { db } from "@/lib/db";
import { seededClassic } from "@/test/seeded-menu";
import { transitionOrder } from "./order-status";
import { placeOrder } from "./place-order";

let orderId: string;

beforeEach(async () => {
  const { burger } = await seededClassic();
  const result = await placeOrder({
    serviceType: "TAKE_AWAY",
    paymentMethod: "COUNTER",
    locale: "en",
    items: [{ id: "line-1", productId: burger.id, isMeal: false, picks: {}, quantity: 1 }],
  });
  if (!result.ok) throw new Error("order was not placed");
  orderId = result.order.id;
});

function current() {
  return db.order.findUniqueOrThrow({ where: { id: orderId } });
}

describe("transitionOrder", () => {
  it("moves the order and stamps the time of the step", async () => {
    expect(await transitionOrder(orderId, "PENDING_PAYMENT", "PAID")).toBe(true);

    const order = await current();
    expect(order.status).toBe("PAID");
    expect(order.paidAt).toBeInstanceOf(Date);
  });

  it("does nothing when the order is no longer in the expected status", async () => {
    await transitionOrder(orderId, "PENDING_PAYMENT", "CANCELLED");

    expect(await transitionOrder(orderId, "PENDING_PAYMENT", "PAID")).toBe(false);
    expect((await current()).status).toBe("CANCELLED");
  });

  it("lets only one of two simultaneous attempts win", async () => {
    const results = await Promise.all([
      transitionOrder(orderId, "PENDING_PAYMENT", "PAID"),
      transitionOrder(orderId, "PENDING_PAYMENT", "CANCELLED"),
    ]);

    expect(results.filter(Boolean)).toHaveLength(1);
    const { status, paidAt, cancelledAt } = await current();
    expect(status === "PAID" ? [paidAt, cancelledAt] : [cancelledAt, paidAt]).toEqual([
      expect.any(Date),
      null,
    ]);
  });
});
