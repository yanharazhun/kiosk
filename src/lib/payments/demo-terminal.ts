import "server-only";
import type { PaymentStatus } from "@/lib/order/types";

type Settle = (status: PaymentStatus) => void;

// One map per server process. Kept on globalThis like the Prisma client, so the
// payment route and the terminal route always see the same instance.
const store = globalThis as unknown as { demoTerminal?: Map<string, Settle> };
const pending = (store.demoTerminal ??= new Map<string, Settle>());

/** Parks the payment request until the terminal answers, the signal aborts
 *  (timeout or the kiosk dropped the request), or a newer attempt replaces it. */
export function waitForTerminal(orderId: string, signal: AbortSignal): Promise<PaymentStatus> {
  pending.get(orderId)?.("superseded");

  const { promise, resolve } = Promise.withResolvers<PaymentStatus>();

  function settle(status: PaymentStatus) {
    signal.removeEventListener("abort", onAbort);
    if (pending.get(orderId) === settle) pending.delete(orderId);
    resolve(status);
  }
  function onAbort() {
    // AbortSignal.timeout aborts with a TimeoutError, a dropped request with an AbortError
    settle(signal.reason?.name === "TimeoutError" ? "timeout" : "disconnected");
  }

  if (signal.aborted) {
    onAbort();
    return promise;
  }
  signal.addEventListener("abort", onAbort, { once: true });
  pending.set(orderId, settle);
  return promise;
}

/** Wakes the parked request. Returns false if nothing is waiting for this order. */
export function settlePayment(
  orderId: string,
  status: "approved" | "declined" | "cancelled",
): boolean {
  const settle = pending.get(orderId);
  if (!settle) return false;
  settle(status);
  return true;
}
