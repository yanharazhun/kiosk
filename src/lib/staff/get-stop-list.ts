import "server-only";
import { db } from "@/lib/db";
import { parseLocalizedText } from "@/lib/i18n/localized-text";
import type { StopList, StopListProduct } from "./types";

export async function getStopList(): Promise<StopList> {
  const rows = await db.product.findMany({
    where: { deletedAt: null },
    orderBy: { id: "asc" },
    select: {
      id: true,
      name: true,
      isAvailable: true,
      _count: { select: { categories: true } },
    },
  });

  const dishes: StopListProduct[] = [];
  const ingredients: StopListProduct[] = [];
  for (const row of rows) {
    const product = {
      id: row.id,
      name: parseLocalizedText(row.name, `product ${row.id}`),
      isAvailable: row.isAvailable,
    };
    (row._count.categories > 0 ? dishes : ingredients).push(product);
  }

  return { dishes, ingredients };
}
