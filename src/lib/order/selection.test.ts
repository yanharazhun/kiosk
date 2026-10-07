import { describe, expect, it } from "vitest";
import { burger, burgerMeal, drink, extras, removals } from "@/test/menu-fixture";
import {
  MAX_QUANTITY,
  createSelection,
  isSelectionComplete,
  optionMax,
  orderedProduct,
  selectionReducer,
  unitPriceMinor,
  type Selection,
} from "./selection";

const [cheese, bacon] = extras.options;
const [onion] = removals.options;
const [cola, lemonade] = drink.options;

function selection(picked: Selection["picked"] = {}, isMeal = false): Selection {
  return { isMeal, picked, quantity: 1 };
}

describe("createSelection", () => {
  it("starts as a single item with quantity 1 and default options picked", () => {
    expect(createSelection(burgerMeal)).toEqual({
      isMeal: false,
      picked: { extras: {}, removals: {}, drink: { cola: 1 }, side: { fries: 1 } },
      quantity: 1,
    });
  });
});

describe("TOGGLE_MEAL", () => {
  it("picks the meal's default drink and side, keeping what was already chosen", () => {
    const state = selection({ extras: { cheese: 1 } });
    const next = selectionReducer(state, { type: "TOGGLE_MEAL", groups: burgerMeal.groups });

    expect(next.isMeal).toBe(true);
    expect(next.picked).toMatchObject({
      extras: { cheese: 1 },
      drink: { cola: 1 },
      side: { fries: 1 },
    });
  });

  it("does not overwrite a drink chosen before the meal was switched off and on", () => {
    const state = selection({ drink: { lemonade: 1 } });
    const next = selectionReducer(state, { type: "TOGGLE_MEAL", groups: burgerMeal.groups });

    expect(next.picked.drink).toEqual({ lemonade: 1 });
  });
});

describe("TOGGLE_OPTION", () => {
  it("switches between options in a single-choice group", () => {
    const state = selection({ drink: { cola: 1 } });
    const next = selectionReducer(state, {
      type: "TOGGLE_OPTION",
      group: drink,
      productId: lemonade.productId,
    });

    expect(next.picked.drink).toEqual({ lemonade: 1 });
  });

  it("keeps the only option of a required single-choice group selected", () => {
    const state = selection({ drink: { cola: 1 } });
    const next = selectionReducer(state, {
      type: "TOGGLE_OPTION",
      group: drink,
      productId: cola.productId,
    });

    expect(next).toBe(state);
  });

  it("unselects an option in an optional group", () => {
    const state = selection({ extras: { cheese: 1, bacon: 1 } });
    const next = selectionReducer(state, {
      type: "TOGGLE_OPTION",
      group: extras,
      productId: bacon.productId,
    });

    expect(next.picked.extras).toEqual({ cheese: 1 });
  });

  it("ignores a new option once the group is full", () => {
    const state = selection({ extras: { cheese: 2, bacon: 1 } });
    const next = selectionReducer(state, {
      type: "TOGGLE_OPTION",
      group: { ...extras, options: [...extras.options, { ...bacon, productId: "egg" }] },
      productId: "egg",
    });

    expect(next).toBe(state);
  });
});

describe("SET_OPTION_QUANTITY", () => {
  it("caps the quantity at the option's own limit", () => {
    const next = selectionReducer(selection(), {
      type: "SET_OPTION_QUANTITY",
      group: extras,
      option: cheese,
      quantity: 5,
    });

    expect(next.picked.extras).toEqual({ cheese: 2 });
  });

  it("caps the quantity at the room left in the group", () => {
    const state = selection({ extras: { bacon: 1 } });
    const next = selectionReducer(state, {
      type: "SET_OPTION_QUANTITY",
      group: { ...extras, maxSelect: 2 },
      option: cheese,
      quantity: 2,
    });

    expect(next.picked.extras).toEqual({ bacon: 1, cheese: 1 });
  });

  it("removes the option when the quantity drops to 0", () => {
    const state = selection({ extras: { cheese: 2 } });
    const next = selectionReducer(state, {
      type: "SET_OPTION_QUANTITY",
      group: extras,
      option: cheese,
      quantity: 0,
    });

    expect(next.picked.extras).toEqual({});
  });

  it("returns the same state object when nothing changes", () => {
    const state = selection({ extras: { cheese: 2 } });
    const next = selectionReducer(state, {
      type: "SET_OPTION_QUANTITY",
      group: extras,
      option: cheese,
      quantity: 3,
    });

    expect(next).toBe(state);
  });
});

describe("SET_QUANTITY", () => {
  it.each([
    [0, 1],
    [-3, 1],
    [7, 7],
    [MAX_QUANTITY + 1, MAX_QUANTITY],
  ])("turns %i into %i", (quantity, expected) => {
    const next = selectionReducer(selection(), { type: "SET_QUANTITY", quantity });

    expect(next.quantity).toBe(expected);
  });
});

describe("optionMax", () => {
  it("allows a removal only once, whatever its maxQuantity", () => {
    expect(optionMax(removals, onion)).toBe(1);
  });

  it("is the smaller of the option's and the group's limit", () => {
    expect(optionMax(extras, cheese)).toBe(2);
    expect(optionMax({ ...extras, maxSelect: 1 }, cheese)).toBe(1);
  });
});

describe("isSelectionComplete", () => {
  it("is false until every required group has a pick", () => {
    expect(isSelectionComplete(burgerMeal, selection({ drink: { cola: 1 } }))).toBe(false);
  });

  it("is true when required groups are filled, even with optional ones empty", () => {
    const state = selection({ drink: { cola: 1 }, side: { fries: 1 } });

    expect(isSelectionComplete(burgerMeal, state)).toBe(true);
  });

  it("is true for a product without required groups", () => {
    expect(isSelectionComplete(burger, selection())).toBe(true);
  });
});

describe("orderedProduct", () => {
  it("is the meal product only when the meal is chosen and exists", () => {
    expect(orderedProduct(burger, burgerMeal, selection({}, true))).toBe(burgerMeal);
    expect(orderedProduct(burger, burgerMeal, selection({}, false))).toBe(burger);
    expect(orderedProduct(burger, undefined, selection({}, true))).toBe(burger);
  });
});

describe("unitPriceMinor", () => {
  it("adds every picked option's price times its quantity", () => {
    const price = unitPriceMinor(burger, { extras: { cheese: 2, bacon: 1 } });

    expect(price).toBe(8900 + 2 * 1000 + 1500);
  });

  it("charges nothing for removals", () => {
    expect(unitPriceMinor(burger, { removals: { onion: 1, pickles: 1 } })).toBe(8900);
  });

  it("ignores picks left in groups the product does not have", () => {
    const picked = { extras: { cheese: 1 }, drink: { lemonade: 1 } };

    expect(unitPriceMinor(burger, picked)).toBe(8900 + 1000);
    expect(unitPriceMinor(burgerMeal, picked)).toBe(12900 + 1000 + 500);
  });

  it("is the base price with nothing picked", () => {
    expect(unitPriceMinor(burgerMeal, {})).toBe(12900);
  });
});
