import "server-only";
import { requireStaff } from "@/lib/auth/session";
import { db } from "@/lib/db";
import { parseLocalizedText } from "@/lib/i18n/localized-text";
import type { StaffOrders } from "./types";

export async function getStaffOrders(): Promise<StaffOrders> {
  await requireStaff();
  const rows = await db.order.findMany({
    where: {
      OR: [
        { status: { in: ["PAID", "PREPARING", "READY"] } },
        { status: "PENDING_PAYMENT", paymentMethod: "COUNTER" },
      ],
    },
    orderBy: [{ createdAt: "asc" }, { id: "asc" }],
    select: {
      id: true,
      number: true,
      status: true,
      serviceType: true,
      paymentMethod: true,
      totalMinor: true,
      createdAt: true,
      paidAt: true,
      items: {
        orderBy: { id: "asc" },
        select: {
          id: true,
          productName: true,
          quantity: true,
          modifiers: {
            orderBy: { id: "asc" },
            select: { id: true, kind: true, name: true, quantity: true },
          },
        },
      },
    },
  });

  return {
    serverNow: new Date().toISOString(),
    orders: rows.map((order) => ({
      id: order.id,
      number: order.number,
      status: order.status,
      serviceType: order.serviceType,
      paymentMethod: order.paymentMethod,
      totalMinor: order.totalMinor,
      createdAt: order.createdAt.toISOString(),
      paidAt: order.paidAt?.toISOString() ?? null,
      items: order.items.map((item) => ({
        id: item.id,
        name: parseLocalizedText(item.productName, `order item ${item.id}`),
        quantity: item.quantity,
        modifiers: item.modifiers.map((modifier) => ({
          id: modifier.id,
          kind: modifier.kind,
          name: parseLocalizedText(modifier.name, `order modifier ${modifier.id}`),
          quantity: modifier.quantity,
        })),
      })),
    })),
  };
}
