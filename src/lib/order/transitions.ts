import type { OrderStatus, PaymentMethod } from "@/generated/prisma/enums";

export const STATUS_TIMESTAMP = {
  PAID: "paidAt",
  PREPARING: "preparingAt",
  READY: "readyAt",
  COMPLETED: "completedAt",
  CANCELLED: "cancelledAt",
} as const satisfies Partial<Record<OrderStatus, string>>;

export type StaffTarget = keyof typeof STATUS_TIMESTAMP;

const TRANSITIONS: Partial<Record<OrderStatus, readonly StaffTarget[]>> = {
  PENDING_PAYMENT: ["PAID", "CANCELLED"],
  PAID: ["PREPARING"],
  PREPARING: ["READY"],
  READY: ["COMPLETED"],
};

export function staffTransitions(
  status: OrderStatus,
  paymentMethod: PaymentMethod,
): readonly StaffTarget[] {
  if (status === "PENDING_PAYMENT" && paymentMethod !== "COUNTER") return [];
  return TRANSITIONS[status] ?? [];
}

export function canStaffTransition(
  from: OrderStatus,
  to: StaffTarget,
  paymentMethod: PaymentMethod,
): boolean {
  return staffTransitions(from, paymentMethod).includes(to);
}
