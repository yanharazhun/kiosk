import type { Menu, MenuGroup, MenuOption, MenuProduct } from "@/lib/menu/types";

function option(productId: string, overrides: Partial<MenuOption> = {}): MenuOption {
  return {
    productId,
    name: { en: productId },
    priceDeltaMinor: 0,
    maxQuantity: 1,
    isDefault: false,
    ...overrides,
  };
}

export const extras: MenuGroup = {
  id: "extras",
  name: { en: "Extras" },
  kind: "ADD",
  minSelect: 0,
  maxSelect: 3,
  options: [
    option("cheese", { priceDeltaMinor: 1000, maxQuantity: 2 }),
    option("bacon", { priceDeltaMinor: 1500 }),
  ],
};

export const removals: MenuGroup = {
  id: "removals",
  name: { en: "Remove" },
  kind: "REMOVE",
  minSelect: 0,
  maxSelect: 2,
  options: [option("onion", { maxQuantity: 5 }), option("pickles")],
};

export const drink: MenuGroup = {
  id: "drink",
  name: { en: "Drink" },
  kind: "ADD",
  minSelect: 1,
  maxSelect: 1,
  options: [option("cola", { isDefault: true }), option("lemonade", { priceDeltaMinor: 500 })],
};

export const side: MenuGroup = {
  id: "side",
  name: { en: "Side" },
  kind: "ADD",
  minSelect: 1,
  maxSelect: 1,
  options: [option("fries", { isDefault: true }), option("salad")],
};

export const burger: MenuProduct = {
  id: "burger",
  name: { en: "Burger" },
  description: null,
  imageUrl: null,
  priceMinor: 8900,
  mealProductId: "burger-meal",
  groups: [extras, removals],
};

export const burgerMeal: MenuProduct = {
  id: "burger-meal",
  name: { en: "Burger meal" },
  description: null,
  imageUrl: null,
  priceMinor: 12900,
  mealProductId: null,
  groups: [extras, removals, drink, side],
};

export const shake: MenuProduct = {
  id: "shake",
  name: { en: "Shake" },
  description: null,
  imageUrl: null,
  priceMinor: 4500,
  mealProductId: null,
  groups: [],
};

export function makeMenu(products: MenuProduct[] = [burger, burgerMeal, shake]): Menu {
  return {
    categories: [],
    products: Object.fromEntries(products.map((product) => [product.id, product])),
  };
}
