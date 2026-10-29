import { describe, expect, it } from "vitest";
import { burger, burgerMeal, makeMenu, shake } from "@/test/menu-fixture";
import { matchingProductIds, tagsIn } from "./filters";

const menu = {
  ...makeMenu([
    { ...burger, tagIds: ["beef", "spicy"] },
    { ...burgerMeal, tagIds: ["beef"] },
    { ...shake, tagIds: ["vegetarian"] },
  ]),
  tags: {
    beef: { id: "beef", name: { en: "Beef" } },
    vegetarian: { id: "vegetarian", name: { en: "Vegetarian" } },
    spicy: { id: "spicy", name: { en: "Spicy" } },
  },
};

const ids = ["burger", "burger-meal", "shake"];

describe("tagsIn", () => {
  it("lists only tags used by the given products, in menu order", () => {
    expect(tagsIn(menu, ["burger", "burger-meal"]).map((tag) => tag.id)).toEqual([
      "beef",
      "spicy",
    ]);
  });

  it("returns nothing when no product is tagged", () => {
    expect(tagsIn({ ...menu, tags: {} }, ids)).toEqual([]);
  });
});

describe("matchingProductIds", () => {
  it("keeps every product when nothing is selected", () => {
    expect(matchingProductIds(menu, ids, [])).toEqual(ids);
  });

  it("keeps products that have all selected tags", () => {
    expect(matchingProductIds(menu, ids, ["beef"])).toEqual(["burger", "burger-meal"]);
    expect(matchingProductIds(menu, ids, ["beef", "spicy"])).toEqual(["burger"]);
  });

  it("returns nothing when no product has every selected tag", () => {
    expect(matchingProductIds(menu, ids, ["beef", "vegetarian"])).toEqual([]);
  });
});
