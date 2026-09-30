import type { MenuGroup, MenuOption, MenuProduct } from "@/lib/menu/types";

export const MAX_QUANTITY = 20;

type GroupPicks = Record<string, number>;

export type Selection = {
  isMeal: boolean;
  picked: Record<string, GroupPicks>;
  quantity: number;
};

export type SelectionAction =
  | { type: "TOGGLE_MEAL"; groups: MenuGroup[] }
  | { type: "TOGGLE_OPTION"; group: MenuGroup; productId: string }
  | {
      type: "SET_OPTION_QUANTITY";
      group: MenuGroup;
      option: MenuOption;
      quantity: number;
    }
  | { type: "SET_QUANTITY"; quantity: number };

function withDefaults(
  picked: Selection["picked"],
  groups: MenuGroup[],
): Selection["picked"] {
  const next = { ...picked };
  for (const group of groups) {
    if (next[group.id]) continue;
    const defaults = group.options
      .filter((option) => option.isDefault)
      .slice(0, group.maxSelect);
    next[group.id] = Object.fromEntries(
      defaults.map((option) => [option.productId, 1]),
    );
  }
  return next;
}

export function createSelection(product: MenuProduct): Selection {
  return {
    isMeal: false,
    picked: withDefaults({}, product.groups),
    quantity: 1,
  };
}

export function orderedProduct(
  product: MenuProduct,
  mealProduct: MenuProduct | undefined,
  selection: Selection,
): MenuProduct {
  return selection.isMeal && mealProduct ? mealProduct : product;
}

export function pickedIn(selection: Selection, groupId: string): GroupPicks {
  return selection.picked[groupId] ?? {};
}

function countOf(picks: GroupPicks): number {
  return Object.values(picks).reduce((sum, quantity) => sum + quantity, 0);
}

/** How many of this option one item may have: REMOVE options are yes/no. */
export function optionMax(group: MenuGroup, option: MenuOption): number {
  if (group.kind === "REMOVE") return 1;
  return Math.min(option.maxQuantity, group.maxSelect);
}

export function isGroupFull(selection: Selection, group: MenuGroup): boolean {
  return countOf(pickedIn(selection, group.id)) >= group.maxSelect;
}

export function isGroupSatisfied(selection: Selection, group: MenuGroup): boolean {
  return countOf(pickedIn(selection, group.id)) >= group.minSelect;
}

export function isSelectionComplete(product: MenuProduct, selection: Selection): boolean {
  return product.groups.every((group) => isGroupSatisfied(selection, group));
}

function setPick(picks: GroupPicks, productId: string, quantity: number): GroupPicks {
  const next = { ...picks };
  if (quantity > 0) next[productId] = quantity;
  else delete next[productId];
  return next;
}

function toggleOption(
  state: Selection,
  group: MenuGroup,
  productId: string,
): GroupPicks | undefined {
  const picks = pickedIn(state, group.id);

  if (picks[productId]) {
    if (group.maxSelect === 1 && group.minSelect === 1) return undefined;
    return setPick(picks, productId, 0);
  }
  if (group.maxSelect === 1) return { [productId]: 1 };
  if (isGroupFull(state, group)) return undefined;
  return setPick(picks, productId, 1);
}

function setOptionQuantity(
  state: Selection,
  group: MenuGroup,
  option: MenuOption,
  quantity: number,
): GroupPicks | undefined {
  const picks = pickedIn(state, group.id);
  const current = picks[option.productId] ?? 0;
  const roomInGroup = group.maxSelect - (countOf(picks) - current);
  const next = Math.max(0, Math.min(quantity, optionMax(group, option), roomInGroup));
  if (next === current) return undefined;
  return setPick(picks, option.productId, next);
}

export function selectionReducer(
  state: Selection,
  action: SelectionAction,
): Selection {
  switch (action.type) {
    case "TOGGLE_MEAL":
      return {
        ...state,
        isMeal: !state.isMeal,
        picked: withDefaults(state.picked, action.groups),
      };
    case "TOGGLE_OPTION":
    case "SET_OPTION_QUANTITY": {
      const picks =
        action.type === "TOGGLE_OPTION"
          ? toggleOption(state, action.group, action.productId)
          : setOptionQuantity(state, action.group, action.option, action.quantity);
      if (!picks) return state;
      return { ...state, picked: { ...state.picked, [action.group.id]: picks } };
    }
    case "SET_QUANTITY":
      return {
        ...state,
        quantity: Math.min(MAX_QUANTITY, Math.max(1, action.quantity)),
      };
  }
}

export function unitPriceMinor(product: MenuProduct, picked: Selection["picked"]): number {
  const optionsMinor = product.groups
    .flatMap((group) => {
      const picks = picked[group.id] ?? {};
      return group.options.map(
        (option) => option.priceDeltaMinor * (picks[option.productId] ?? 0),
      );
    })
    .reduce((sum, amount) => sum + amount, 0);
  return product.priceMinor + optionsMinor;
}
