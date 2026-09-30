import type { ServiceType } from "@/generated/prisma/enums";
import { defaultLocale, type Locale } from "@/lib/i18n/locale";
import {
  addItem,
  setItemQuantity,
  updateItem,
  type CartItem,
  type NewCartItem,
} from "@/lib/order/cart";

export type OrderState = {
  locale: Locale;
  serviceType: ServiceType | null;
  items: CartItem[];
  lastItemId: number;
};

export type OrderAction =
  | { type: "SET_LOCALE"; locale: Locale }
  | { type: "SET_SERVICE_TYPE"; serviceType: ServiceType }
  | { type: "ADD_ITEM"; item: NewCartItem }
  | { type: "UPDATE_ITEM"; id: string; item: NewCartItem }
  | { type: "SET_ITEM_QUANTITY"; id: string; quantity: number }
  | { type: "RESET" };

export const initialOrderState: OrderState = {
  locale: defaultLocale,
  serviceType: null,
  items: [],
  lastItemId: 0,
};

export function orderReducer(state: OrderState, action: OrderAction): OrderState {
  switch (action.type) {
    case "SET_LOCALE":
      return { ...state, locale: action.locale };
    case "SET_SERVICE_TYPE":
      return { ...state, serviceType: action.serviceType };
    case "ADD_ITEM": {
      const lastItemId = state.lastItemId + 1;
      return {
        ...state,
        lastItemId,
        items: addItem(state.items, action.item, String(lastItemId)),
      };
    }
    case "UPDATE_ITEM":
      return { ...state, items: updateItem(state.items, action.id, action.item) };
    case "SET_ITEM_QUANTITY":
      return {
        ...state,
        items: setItemQuantity(state.items, action.id, action.quantity),
      };
    case "RESET":
      return initialOrderState;
  }
}
