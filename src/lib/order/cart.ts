import type { LocalizedText } from "@/lib/i18n/localized-text";
import type { Menu, MenuGroup, MenuProduct } from "@/lib/menu/types";
import {
  MAX_QUANTITY,
  orderedProduct,
  unitPriceMinor,
  type Selection,
} from "./selection";

export type CartItem = {
  id: string;
  productId: string;
  isMeal: boolean;
  picks: Selection["picked"];
  quantity: number;
};

export type NewCartItem = Omit<CartItem, "id">;

const clampQuantity = (quantity: number) => Math.min(MAX_QUANTITY, quantity);

/** Turns the sheet's selection into a cart line: only groups of what is really
 *  ordered (meal or not) survive, and empty groups are dropped. */
export function toCartItem(
  product: MenuProduct,
  mealProduct: MenuProduct | undefined,
  selection: Selection,
): NewCartItem {
  const ordered = orderedProduct(product, mealProduct, selection);
  const picks: Selection["picked"] = {};
  for (const group of ordered.groups) {
    const groupPicks = selection.picked[group.id];
    if (groupPicks && Object.keys(groupPicks).length > 0) {
      picks[group.id] = groupPicks;
    }
  }

  return {
    productId: product.id,
    isMeal: ordered !== product,
    picks,
    quantity: selection.quantity,
  };
}

/** Same product + same meal flag + same picks → same key, regardless of the
 *  order in which options were tapped. */
function configKey(item: NewCartItem): string {
  const picks = Object.keys(item.picks)
    .sort()
    .map((groupId) => {
      const group = item.picks[groupId];
      const options = Object.keys(group)
        .sort()
        .map((productId) => `${productId}:${group[productId]}`)
        .join(",");
      return `${groupId}=${options}`;
    })
    .join(";");
  return `${item.productId}|${item.isMeal ? "meal" : "single"}|${picks}`;
}

export function addItem(items: CartItem[], item: NewCartItem, id: string): CartItem[] {
  const key = configKey(item);
  const twin = items.find((line) => configKey(line) === key);
  if (!twin) return [...items, { ...item, id }];
  return items.map((line) =>
    line === twin ? { ...line, quantity: clampQuantity(line.quantity + item.quantity) } : line,
  );
}

/** Edit from the cart: the line keeps its id and place, unless the new config
 *  matches another line, in which case the two are merged. */
export function updateItem(items: CartItem[], id: string, item: NewCartItem): CartItem[] {
  const key = configKey(item);
  const twin = items.find((line) => line.id !== id && configKey(line) === key);
  if (!twin) return items.map((line) => (line.id === id ? { ...item, id } : line));
  return items
    .filter((line) => line.id !== id)
    .map((line) =>
      line === twin
        ? { ...line, quantity: clampQuantity(line.quantity + item.quantity) }
        : line,
    );
}

export function setItemQuantity(items: CartItem[], id: string, quantity: number): CartItem[] {
  if (quantity <= 0) return items.filter((line) => line.id !== id);
  return items.map((line) =>
    line.id === id ? { ...line, quantity: clampQuantity(quantity) } : line,
  );
}

/** The product a line actually orders, or undefined if it left the menu. */
export function lineProduct(menu: Menu, item: CartItem): MenuProduct | undefined {
  const product = menu.products[item.productId];
  if (!product || !item.isMeal) return product;
  return product.mealProductId === null ? undefined : menu.products[product.mealProductId];
}

export function lineTotalMinor(menu: Menu, item: CartItem): number {
  const product = lineProduct(menu, item);
  if (!product) return 0;
  return unitPriceMinor(product, item.picks) * item.quantity;
}

/** Lines whose product left the menu (e.g. sold out after a refresh) are not counted. */
export function cartSummary(menu: Menu, items: CartItem[]) {
  const available = items.filter((item) => lineProduct(menu, item));
  return {
    count: available.reduce((sum, item) => sum + item.quantity, 0),
    totalMinor: available.reduce((sum, item) => sum + lineTotalMinor(menu, item), 0),
  };
}

export type LineDetail = {
  key: string;
  kind: "choice" | "add" | "remove";
  name: LocalizedText;
  quantity: number;
};

const DETAIL_ORDER: Record<LineDetail["kind"], number> = { choice: 0, add: 1, remove: 2 };

function detailKind(group: MenuGroup): LineDetail["kind"] {
  if (group.kind === "REMOVE") return "remove";
  if (group.minSelect > 0) return "choice";
  return "add";
}

/** What was chosen for a line, for the detail text under its name:
 *  required choices (drink, side) first, then extras, then removals. */
export function lineDetails(menu: Menu, item: CartItem): LineDetail[] {
  const product = lineProduct(menu, item);
  if (!product) return [];

  return product.groups
    .flatMap((group) => {
      const picks = item.picks[group.id] ?? {};
      const kind = detailKind(group);
      return group.options
        .filter((option) => picks[option.productId])
        .map((option) => ({
          key: `${group.id}:${option.productId}`,
          kind,
          name: option.name,
          quantity: picks[option.productId],
        }));
    })
    .sort((a, b) => DETAIL_ORDER[a.kind] - DETAIL_ORDER[b.kind]);
}

export function toSelection(item: CartItem): Selection {
  return { isMeal: item.isMeal, picked: item.picks, quantity: item.quantity };
}
