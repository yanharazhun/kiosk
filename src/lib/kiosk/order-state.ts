import type { ServiceType } from "@/generated/prisma/enums";
import { defaultLocale, type Locale } from "@/lib/i18n/locale";

export type OrderState = {
  locale: Locale;
  serviceType: ServiceType | null;
};

export type OrderAction =
  | { type: "SET_LOCALE"; locale: Locale }
  | { type: "SET_SERVICE_TYPE"; serviceType: ServiceType }
  | { type: "RESET" };

export const initialOrderState: OrderState = {
  locale: defaultLocale,
  serviceType: null,
};

export function orderReducer(state: OrderState, action: OrderAction): OrderState {
  switch (action.type) {
    case "SET_LOCALE":
      return { ...state, locale: action.locale };
    case "SET_SERVICE_TYPE":
      return { ...state, serviceType: action.serviceType };
    case "RESET":
      return initialOrderState;
  }
}
