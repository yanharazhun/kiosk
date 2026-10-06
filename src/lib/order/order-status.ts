import "server-only";
import type { OrderStatus } from "@/generated/prisma/enums";
import { db } from "@/lib/db";
import { STATUS_TIMESTAMP, type StaffTarget } from "./transitions";

// Compare-and-set transitions (doc 16): the WHERE on the current status makes
// a concurrent second attempt update 0 rows instead of overwriting the first.

export async function transitionOrder(
  orderId: string,
  from: OrderStatus,
  to: StaffTarget,
): Promise<boolean> {
  const { count } = await db.order.updateMany({
    where: { id: orderId, status: from },
    data: { status: to, [STATUS_TIMESTAMP[to]]: new Date() },
  });
  return count === 1;
}

export function markPaid(orderId: string): Promise<boolean> {
  return transitionOrder(orderId, "PENDING_PAYMENT", "PAID");
}

export function markCancelled(orderId: string): Promise<boolean> {
  return transitionOrder(orderId, "PENDING_PAYMENT", "CANCELLED");
}
