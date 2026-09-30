import { useReducer } from "react";
import type { MenuGroup, MenuOption, MenuProduct } from "@/lib/menu/types";
import {
  createSelection,
  isSelectionComplete,
  orderedProduct,
  selectionReducer,
  unitPriceMinor,
} from "@/lib/order/selection";
import { useKiosk } from "./kiosk-provider";

export function useProductSelection(product: MenuProduct) {
  const { menu } = useKiosk();
  const [selection, dispatch] = useReducer(selectionReducer, product, createSelection);

  const mealProduct =
    product.mealProductId === null ? undefined : menu.products[product.mealProductId];
  const ordered = orderedProduct(product, mealProduct, selection);
  const groups = ordered.groups;

  return {
    selection,
    mealProduct,
    requiredGroups: groups.filter((group) => group.minSelect > 0),
    addGroups: groups.filter((group) => group.minSelect === 0 && group.kind === "ADD"),
    removeGroups: groups.filter((group) => group.minSelect === 0 && group.kind === "REMOVE"),
    isComplete: isSelectionComplete(ordered, selection),
    totalMinor: unitPriceMinor(ordered, selection) * selection.quantity,
    toggleMeal: () => {
      const next = selection.isMeal ? product : (mealProduct ?? product);
      dispatch({ type: "TOGGLE_MEAL", groups: next.groups });
    },
    toggleOption: (group: MenuGroup, productId: string) =>
      dispatch({ type: "TOGGLE_OPTION", group, productId }),
    setOptionQuantity: (group: MenuGroup, option: MenuOption, quantity: number) =>
      dispatch({ type: "SET_OPTION_QUANTITY", group, option, quantity }),
    setQuantity: (quantity: number) => dispatch({ type: "SET_QUANTITY", quantity }),
  };
}
