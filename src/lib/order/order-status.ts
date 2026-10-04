import "server-only";
import { db } from "@/lib/db";

// Compare-and-set transitions (doc 16): the WHERE on the current status makes
// a concurrent second attempt update 0 rows instead of overwriting the first.

export async function markPaid(orderId: string): Promise<boolean> {
  const { count } = await db.order.updateMany({
    where: { id: orderId, status: "PENDING_PAYMENT" },
    data: { status: "PAID", paidAt: new Date() },
  });
  return count === 1;
}

export async function markCancelled(orderId: string): Promise<boolean> {
  const { count } = await db.order.updateMany({
    where: { id: orderId, status: "PENDING_PAYMENT" },
    data: { status: "CANCELLED", cancelledAt: new Date() },
  });
  return count === 1;
}
