import type { Menu, MenuTag } from "./types";

export function tagsIn(menu: Menu, productIds: string[]): MenuTag[] {
  const present = new Set(
    productIds.flatMap((id) => menu.products[id]?.tagIds ?? []),
  );
  return Object.values(menu.tags).filter((tag) => present.has(tag.id));
}

export function matchingProductIds(
  menu: Menu,
  productIds: string[],
  selectedTagIds: string[],
): string[] {
  return productIds.filter((id) => {
    const tagIds = menu.products[id]?.tagIds ?? [];
    return selectedTagIds.every((tagId) => tagIds.includes(tagId));
  });
}
