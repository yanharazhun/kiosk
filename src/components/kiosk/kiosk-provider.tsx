"use client";

import { usePathname, useRouter } from "next/navigation";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useReducer,
  useRef,
  useState,
  type Dispatch,
  type ReactNode,
} from "react";
import { useAppEvents } from "@/components/realtime/use-app-events";
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

type KioskProviderProps = {
  menu: Menu;
  children: ReactNode;
};

const CHECKOUT_PATHS = ["/pay", "/pay/card", "/done"];

export function KioskProvider({ menu: initialMenu, children }: KioskProviderProps) {
  const [state, dispatch] = useReducer(orderReducer, initialOrderState);
  const [menu, setMenu] = useState(initialMenu);
  const router = useRouter();
  const pathname = usePathname();
  const isCheckout = CHECKOUT_PATHS.includes(pathname);
  const isMenuStale = useRef(false);
  const inFlight = useRef<AbortController | null>(null);

  const reloadMenu = useCallback(() => {
    inFlight.current?.abort();
    const controller = new AbortController();
    inFlight.current = controller;

    fetch("/api/menu", { signal: controller.signal })
      .then((response) => {
        if (!response.ok) throw new Error(`Menu refresh failed: ${response.status}`);
        return response.json() as Promise<Menu>;
      })
      .then((fresh) => {
        isMenuStale.current = false;
        setMenu(fresh);
      })
      .catch((error: unknown) => {
        if (!controller.signal.aborted) console.warn(error);
      });
  }, []);

  function requestMenuReload() {
    if (isCheckout) isMenuStale.current = true;
    else reloadMenu();
  }

  useAppEvents({
    onEvent: (event) => {
      if (event === "menu-changed") requestMenuReload();
    },
    onReconnect: requestMenuReload,
  });

  useEffect(() => {
    if (!isCheckout && isMenuStale.current) reloadMenu();
  }, [isCheckout, reloadMenu]);

  useEffect(() => () => inFlight.current?.abort(), []);

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
