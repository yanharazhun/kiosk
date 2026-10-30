import "server-only";
import { db } from "@/lib/db";
import { parseLocalizedText as parseText } from "@/lib/i18n/localized-text";
import type { Menu, MenuCategory, MenuGroup, MenuProduct, MenuTag } from "./types";

function canBeSatisfied(group: MenuGroup): boolean {
  const capacity = group.options.reduce(
    (sum, option) => sum + option.maxQuantity,
    0,
  );
  return capacity >= group.minSelect;
}

function loadRows() {
  return Promise.all([
    db.category.findMany({
      where: { deletedAt: null },
      orderBy: [{ sortOrder: "asc" }, { id: "asc" }],
      select: {
        id: true,
        name: true,
        imageUrl: true,
        products: {
          orderBy: [{ sortOrder: "asc" }, { productId: "asc" }],
          select: { productId: true },
        },
      },
    }),
    db.product.findMany({
      where: { deletedAt: null, isAvailable: true },
      select: {
        id: true,
        name: true,
        description: true,
        imageUrl: true,
        priceMinor: true,
        mealProductId: true,
        modifierGroups: {
          orderBy: [{ sortOrder: "asc" }, { groupId: "asc" }],
          select: { groupId: true },
        },
        tags: { select: { tagId: true } },
      },
    }),
    db.modifierGroup.findMany({
      where: { deletedAt: null },
      select: {
        id: true,
        name: true,
        kind: true,
        minSelect: true,
        maxSelect: true,
        modifiers: {
          orderBy: [{ sortOrder: "asc" }, { productId: "asc" }],
          select: {
            productId: true,
            priceDeltaMinor: true,
            maxQuantity: true,
            isDefault: true,
          },
        },
      },
    }),
    db.tag.findMany({
      where: { deletedAt: null },
      orderBy: [{ sortOrder: "asc" }, { id: "asc" }],
      select: { id: true, name: true },
    }),
  ]);
}

export async function getMenu(): Promise<Menu> {
  const [categoryRows, productRows, groupRows, tagRows] = await loadRows();

  const productNames = new Map(
    productRows.map((row) => [row.id, parseText(row.name, `product ${row.id}`)]),
  );

  const groupsById = new Map<string, MenuGroup>();
  for (const row of groupRows) {
    const options = row.modifiers.flatMap((modifier) => {
      const name = productNames.get(modifier.productId);
      if (!name) return [];
      return [{ ...modifier, name }];
    });

    groupsById.set(row.id, {
      id: row.id,
      name: parseText(row.name, `modifier group ${row.id}`),
      kind: row.kind,
      minSelect: row.minSelect,
      maxSelect: row.maxSelect,
      options,
    });
  }

  const activeTagIds = new Set(tagRows.map((row) => row.id));

  const orderable = new Map<string, MenuProduct>();
  for (const row of productRows) {
    const groups = row.modifierGroups.flatMap(({ groupId }) => {
      const group = groupsById.get(groupId);
      return group ? [group] : [];
    });
    const name = productNames.get(row.id);
    if (!name || !groups.every(canBeSatisfied)) continue;

    orderable.set(row.id, {
      id: row.id,
      name,
      description:
        row.description === null
          ? null
          : parseText(row.description, `product ${row.id} description`),
      imageUrl: row.imageUrl,
      priceMinor: row.priceMinor,
      mealProductId: row.mealProductId,
      groups: groups.filter((group) => group.options.length > 0),
      tagIds: row.tags
        .map((link) => link.tagId)
        .filter((id) => activeTagIds.has(id)),
    });
  }

  const categories: MenuCategory[] = categoryRows.flatMap((row) => {
    const productIds = row.products
      .map((link) => link.productId)
      .filter((id) => orderable.has(id));
    if (productIds.length === 0) return [];

    return [
      {
        id: row.id,
        name: parseText(row.name, `category ${row.id}`),
        imageUrl: row.imageUrl,
        productIds,
      },
    ];
  });

  const products: Record<string, MenuProduct> = {};
  const include = (id: string) => {
    const product = orderable.get(id);
    if (product) products[id] = product;
  };

  for (const category of categories) {
    for (const id of category.productIds) include(id);
  }

  for (const product of Object.values(products)) {
    if (product.mealProductId === null) continue;
    if (orderable.has(product.mealProductId)) {
      include(product.mealProductId);
    } else {
      products[product.id] = { ...product, mealProductId: null };
    }
  }

  const usedTagIds = new Set(
    Object.values(products).flatMap((product) => product.tagIds),
  );
  const tags: Record<string, MenuTag> = {};
  for (const row of tagRows) {
    if (!usedTagIds.has(row.id)) continue;
    tags[row.id] = { id: row.id, name: parseText(row.name, `tag ${row.id}`) };
  }

  return { categories, products, tags };
}
