import { z } from "zod";
import { markCancelled } from "@/lib/order/order-status";
import { settlePayment } from "@/lib/payments/demo-terminal";

const bodySchema = z.object({ orderId: z.uuid() });

export async function POST(request: Request) {
  const parsed = bodySchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return Response.json({ error: "invalid" }, { status: 400 });
  const { orderId } = parsed.data;

  // A parked payment request cancels the order itself when woken; otherwise
  // (e.g. after a decline) nothing is waiting and we cancel here.
  if (!settlePayment(orderId, "cancelled")) await markCancelled(orderId);

  return Response.json({ ok: true });
}
