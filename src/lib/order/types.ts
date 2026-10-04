import type { PaymentMethod } from "@/generated/prisma/enums";

export type PlacedOrder = {
  id: string;
  number: number;
  totalMinor: number;
  paymentMethod: PaymentMethod;
};

export type PlaceOrderResult =
  | { ok: true; order: PlacedOrder }
  | { ok: false; reason: "invalid" | "unavailable" };

/** What POST /api/payments answers once the terminal (or a timeout) decides. */
export type PaymentStatus =
  | "approved"
  | "declined"
  | "timeout"
  | "cancelled"
  | "disconnected"
  | "superseded"
  | "failed";
