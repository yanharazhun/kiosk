"use server";

import { placeOrder } from "@/lib/order/place-order";
import type { PlaceOrderResult } from "@/lib/order/types";

// The input is validated inside placeOrder: an action is a public endpoint.
export async function placeOrderAction(input: unknown): Promise<PlaceOrderResult> {
  return placeOrder(input);
}
