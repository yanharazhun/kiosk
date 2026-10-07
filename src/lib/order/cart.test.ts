import { describe, expect, it } from "vitest";
import { burger, burgerMeal, makeMenu, shake } from "@/test/menu-fixture";
import {
  addItem,
  cartSummary,
  lineDetails,
  lineProduct,
  lineTotalMinor,
  setItemQuantity,
  toCartItem,
  updateItem,
  type CartItem,
  type NewCartItem,
} from "./cart";
import { MAX_QUANTITY } from "./selection";

const menu = makeMenu();

function newItem(overrides: Partial<NewCartItem> = {}): NewCartItem {
  return { productId: "burger", isMeal: false, picks: {}, quantity: 1, ...overrides };
}

function line(id: string, overrides: Partial<NewCartItem> = {}): CartItem {
  return { id, ...newItem(overrides) };
}

describe("toCartItem", () => {
  it("drops meal-only groups when the item is not a meal", () => {
    const item = toCartItem(burger, burgerMeal, {
      isMeal: false,
      picked: { extras: { cheese: 1 }, drink: { cola: 1 }, side: { fries: 1 } },
      quantity: 2,
    });

    expect(item).toEqual(newItem({ picks: { extras: { cheese: 1 } }, quantity: 2 }));
  });

  it("keeps the base product id and marks the line as a meal", () => {
    const item = toCartItem(burger, burgerMeal, {
      isMeal: true,
      picked: { drink: { cola: 1 }, side: { fries: 1 } },
      quantity: 1,
    });

    expect(item.productId).toBe("burger");
    expect(item.isMeal).toBe(true);
    expect(item.picks).toEqual({ drink: { cola: 1 }, side: { fries: 1 } });
  });

  it("drops empty groups", () => {
    const item = toCartItem(burger, burgerMeal, {
      isMeal: false,
      picked: { extras: {}, removals: {} },
      quantity: 1,
    });

    expect(item.picks).toEqual({});
  });
});

describe("addItem", () => {
  it("merges a line with the same configuration, whatever order options were tapped in", () => {
    const items = [line("a", { picks: { extras: { cheese: 1, bacon: 1 } } })];
    const next = addItem(items, newItem({ picks: { extras: { bacon: 1, cheese: 1 } }, quantity: 2 }), "b");

    expect(next).toEqual([line("a", { picks: { extras: { cheese: 1, bacon: 1 } }, quantity: 3 })]);
  });

  it("adds a separate line when the configuration differs", () => {
    const items = [line("a", { picks: { extras: { cheese: 1 } } })];

    expect(addItem(items, newItem({ picks: { extras: { cheese: 2 } } }), "b")).toHaveLength(2);
    expect(addItem(items, newItem({ picks: { extras: { cheese: 1 } }, isMeal: true }), "b")).toHaveLength(2);
  });

  it("does not let a merged line go above the maximum quantity", () => {
    const items = [line("a", { quantity: MAX_QUANTITY - 1 })];
    const next = addItem(items, newItem({ quantity: 5 }), "b");

    expect(next[0].quantity).toBe(MAX_QUANTITY);
  });
});

describe("updateItem", () => {
  it("keeps the line's id and position", () => {
    const items = [line("a"), line("b", { productId: "shake" }), line("c", { quantity: 4 })];
    const next = updateItem(items, "b", newItem({ productId: "shake", quantity: 3 }));

    expect(next.map((item) => item.id)).toEqual(["a", "b", "c"]);
    expect(next[1].quantity).toBe(3);
  });

  it("merges into another line when the edit makes them identical", () => {
    const items = [line("a", { picks: { extras: { cheese: 1 } } }), line("b", { quantity: 2 })];
    const next = updateItem(items, "a", newItem({ quantity: 1 }));

    expect(next).toEqual([line("b", { quantity: 3 })]);
  });
});

describe("setItemQuantity", () => {
  it("removes the line at 0", () => {
    expect(setItemQuantity([line("a"), line("b")], "a", 0)).toEqual([line("b")]);
  });

  it("caps the quantity at the maximum", () => {
    expect(setItemQuantity([line("a")], "a", 99)[0].quantity).toBe(MAX_QUANTITY);
  });
});

describe("lineProduct", () => {
  it("is the meal product for a meal line", () => {
    expect(lineProduct(menu, line("a", { isMeal: true }))).toBe(burgerMeal);
  });

  it("is undefined when the product or its meal has left the menu", () => {
    expect(lineProduct(makeMenu([shake]), line("a"))).toBeUndefined();
    expect(lineProduct(makeMenu([burger]), line("a", { isMeal: true }))).toBeUndefined();
  });
});

describe("lineTotalMinor", () => {
  it("is the unit price with options times the quantity", () => {
    const item = line("a", { isMeal: true, picks: { extras: { cheese: 2 } }, quantity: 3 });

    expect(lineTotalMinor(menu, item)).toBe((12900 + 2000) * 3);
  });
});

describe("cartSummary", () => {
  it("counts items and adds up totals", () => {
    const items = [line("a", { quantity: 2 }), line("b", { productId: "shake" })];

    expect(cartSummary(menu, items)).toEqual({ count: 3, totalMinor: 2 * 8900 + 4500 });
  });

  it("leaves out lines whose product is no longer on the menu", () => {
    const items = [line("a", { quantity: 2 }), line("b", { productId: "shake" })];

    expect(cartSummary(makeMenu([shake]), items)).toEqual({ count: 1, totalMinor: 4500 });
  });
});

describe("lineDetails", () => {
  it("lists required choices first, then extras, then removals", () => {
    const item = line("a", {
      isMeal: true,
      picks: {
        removals: { onion: 1 },
        extras: { cheese: 2 },
        drink: { cola: 1 },
        side: { fries: 1 },
      },
    });

    expect(lineDetails(menu, item).map(({ kind, quantity, name }) => [kind, name.en, quantity])).toEqual([
      ["choice", "cola", 1],
      ["choice", "fries", 1],
      ["add", "cheese", 2],
      ["remove", "onion", 1],
    ]);
  });
});
