import "server-only";
import { z } from "zod";
import type { Prisma } from "@/generated/prisma/client";
import { db } from "@/lib/db";
import { locales } from "@/lib/i18n/locale";
import { getMenu } from "@/lib/menu/get-menu";
import type { Menu } from "@/lib/menu/types";
import { businessDate } from "./business-date";
import { lineProduct, type CartItem } from "./cart";
import { MAX_QUANTITY, optionMax, unitPriceMinor } from "./selection";
import type { PlaceOrderResult } from "./types";

const quantity = z.number().int().min(1).max(MAX_QUANTITY);

const inputSchema = z.object({
  serviceType: z.enum(["EAT_IN", "TAKE_AWAY"]),
  paymentMethod: z.enum(["CARD", "COUNTER"]),
  locale: z.enum(locales),
  items: z
    .array(
      z.object({
        id: z.string(),
        productId: z.uuid(),
        isMeal: z.boolean(),
        picks: z.record(z.uuid(), z.record(z.uuid(), quantity)),
        quantity,
      }),
    )
    .min(1)
    .max(50),
});

type OrderLine = Prisma.OrderItemCreateWithoutOrderInput;

/** Re-checks one cart line against the current menu and prices it.
 *  The client only says *what* it wants; names and prices come from the DB. */
function buildLine(menu: Menu, item: CartItem): OrderLine | null {
  const product = lineProduct(menu, item);
  if (!product) return null;

  const modifiers: Prisma.OrderItemModifierCreateWithoutOrderItemInput[] = [];
  for (const [groupId, picks] of Object.entries(item.picks)) {
    const group = product.groups.find((candidate) => candidate.id === groupId);
    if (!group) return null;

    let count = 0;
    for (const [optionId, optionQuantity] of Object.entries(picks)) {
      const option = group.options.find((candidate) => candidate.productId === optionId);
      if (!option || optionQuantity > optionMax(group, option)) return null;
      count += optionQuantity;
      modifiers.push({
        product: { connect: { id: option.productId } },
        groupName: group.name,
        kind: group.kind,
        name: option.name,
        priceDeltaMinor: option.priceDeltaMinor,
        quantity: optionQuantity,
      });
    }
    if (count > group.maxSelect) return null;
  }

  const isComplete = product.groups.every((group) => {
    const picks = item.picks[group.id] ?? {};
    const count = Object.values(picks).reduce((sum, value) => sum + value, 0);
    return count >= group.minSelect;
  });
  if (!isComplete) return null;

  return {
    product: { connect: { id: product.id } },
    productName: product.name,
    basePriceMinor: product.priceMinor,
    unitPriceMinor: unitPriceMinor(product, item.picks),
    quantity: item.quantity,
    modifiers: { create: modifiers },
  };
}

// Until kiosk PIN login exists (doc 20), every order is attributed to the seeded demo kiosk.
async function kioskUserId(): Promise<string> {
  const kiosk = await db.user.findUnique({
    where: { username: "demo" },
    select: { id: true },
  });
  if (!kiosk) throw new Error('Kiosk account "demo" is missing; run the seed');
  return kiosk.id;
}

export async function placeOrder(input: unknown): Promise<PlaceOrderResult> {
  const parsed = inputSchema.safeParse(input);
  if (!parsed.success) return { ok: false, reason: "invalid" };
  const { serviceType, paymentMethod, locale, items } = parsed.data;

  const menu = await getMenu();
  const lines = items.map((item) => buildLine(menu, item));
  if (lines.some((line) => line === null)) return { ok: false, reason: "unavailable" };
  const orderLines = lines as OrderLine[];

  const totalMinor = orderLines.reduce(
    (sum, line) => sum + line.unitPriceMinor * line.quantity,
    0,
  );
  const createdById = await kioskUserId();
  const day = businessDate();

  const order = await db.$transaction(async (tx) => {
    // Atomic increment (doc 17): concurrent kiosks queue on this row, never share a number.
    const { lastNumber } = await tx.orderCounter.upsert({
      where: { businessDate: day },
      create: { businessDate: day, lastNumber: 1 },
      update: { lastNumber: { increment: 1 } },
    });
    return tx.order.create({
      data: {
        number: lastNumber,
        businessDate: day,
        serviceType,
        paymentMethod,
        locale,
        totalMinor,
        createdBy: { connect: { id: createdById } },
        items: { create: orderLines },
      },
      select: { id: true, number: true, totalMinor: true, paymentMethod: true },
    });
  });

  return { ok: true, order };
}
