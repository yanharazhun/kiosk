"use client";

import { useRouter } from "next/navigation";
import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useReducer,
  type Dispatch,
  type ReactNode,
} from "react";
import { messages, type Messages } from "@/lib/i18n/messages";
import {
  initialOrderState,
  orderReducer,
  type OrderAction,
  type OrderState,
} from "@/lib/kiosk/order-state";
import type { Menu } from "@/lib/menu/types";

type KioskContextValue = {
  menu: Menu;
  state: OrderState;
  dispatch: Dispatch<OrderAction>;
  t: Messages;
  resetOrder: () => void;
};

const KioskContext = createContext<KioskContextValue | null>(null);

export function KioskProvider({
  menu,
  children,
}: {
  menu: Menu;
  children: ReactNode;
}) {
  const [state, dispatch] = useReducer(orderReducer, initialOrderState);
  const router = useRouter();

  const resetOrder = useCallback(() => {
    dispatch({ type: "RESET" });
    router.replace("/");
  }, [router]);

  const value = useMemo(
    () => ({ menu, state, dispatch, t: messages[state.locale], resetOrder }),
    [menu, state, resetOrder],
  );

  return <KioskContext value={value}>{children}</KioskContext>;
}

export function useKiosk(): KioskContextValue {
  const value = useContext(KioskContext);
  if (!value) throw new Error("useKiosk must be used inside KioskProvider");
  return value;
}
