import { z } from "zod";
import { db } from "@/lib/db";
import { markCancelled, markPaid } from "@/lib/order/order-status";
import type { PaymentStatus } from "@/lib/order/types";
import { waitForTerminal } from "@/lib/payments/demo-terminal";

const PAYMENT_TIMEOUT_MS = 60_000;

const bodySchema = z.object({ orderId: z.uuid() });

// A Route Handler, not a Server Action: actions are dispatched one at a time per
// client, so a parked action would block the terminal and Cancel requests behind it.
// TODO: require a kiosk session once PIN login exists (doc 20).
export async function POST(request: Request) {
  const parsed = bodySchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return Response.json({ error: "invalid" }, { status: 400 });
  const { orderId } = parsed.data;

  const order = await db.order.findUnique({
    where: { id: orderId },
    select: { status: true, paymentMethod: true },
  });
  if (order?.status !== "PENDING_PAYMENT" || order.paymentMethod !== "CARD") {
    return Response.json({ error: "not_payable" }, { status: 409 });
  }

  const signal = AbortSignal.any([request.signal, AbortSignal.timeout(PAYMENT_TIMEOUT_MS)]);
  let status: PaymentStatus = await waitForTerminal(orderId, signal);

  if (status === "approved" && !(await markPaid(orderId))) status = "failed";
  if (status === "cancelled") await markCancelled(orderId);

  return Response.json({ status });
}
