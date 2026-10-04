import { z } from "zod";
import { settlePayment } from "@/lib/payments/demo-terminal";

const bodySchema = z.object({
  orderId: z.uuid(),
  result: z.enum(["approved", "declined"]),
});

// Stands in for the card terminal's callback. A real provider (Stripe Terminal,
// Nets) would call a webhook with a verified signature instead; this one is
// open to anyone and exists only for the demo.
export async function POST(request: Request) {
  const parsed = bodySchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return Response.json({ error: "invalid" }, { status: 400 });

  const settled = settlePayment(parsed.data.orderId, parsed.data.result);
  return Response.json({ settled });
}
