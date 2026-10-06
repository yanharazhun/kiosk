"use server";

import { z } from "zod";
import { db } from "@/lib/db";
import { transitionOrder } from "@/lib/order/order-status";
import { canStaffTransition, type StaffTarget } from "@/lib/order/transitions";

export type StaffActionResult =
  | { ok: true }
  | { ok: false; reason: "invalid" | "not_allowed" | "conflict" };

const targets = [
  "PAID",
  "PREPARING",
  "READY",
  "COMPLETED",
  "CANCELLED",
] as const satisfies readonly StaffTarget[];

const statusSchema = z.object({
  orderId: z.uuid(),
  to: z.enum(targets),
});

export async function changeOrderStatus(input: unknown): Promise<StaffActionResult> {
  const parsed = statusSchema.safeParse(input);
  if (!parsed.success) return { ok: false, reason: "invalid" };
  const { orderId, to } = parsed.data;

  const order = await db.order.findUnique({
    where: { id: orderId },
    select: { status: true, paymentMethod: true },
  });
  if (!order || !canStaffTransition(order.status, to, order.paymentMethod)) {
    return { ok: false, reason: "not_allowed" };
  }

  const moved = await transitionOrder(orderId, order.status, to);
  return moved ? { ok: true } : { ok: false, reason: "conflict" };
}

const availabilitySchema = z.object({
  productId: z.uuid(),
  isAvailable: z.boolean(),
});

export async function setProductAvailability(input: unknown): Promise<StaffActionResult> {
  const parsed = availabilitySchema.safeParse(input);
  if (!parsed.success) return { ok: false, reason: "invalid" };
  const { productId, isAvailable } = parsed.data;

  const { count } = await db.product.updateMany({
    where: { id: productId, deletedAt: null },
    data: { isAvailable },
  });
  return count === 1 ? { ok: true } : { ok: false, reason: "not_allowed" };
}
