"use client";

import { usePathname } from "next/navigation";
import { IdleGuard } from "./idle-guard";
import { useKiosk } from "./kiosk-provider";

const IDLE_PATHS = ["/mode", "/menu", "/cart", "/pay"];

export function KioskIdleGuard() {
  const pathname = usePathname();
  const { resetOrder } = useKiosk();

  return (
    <IdleGuard key={pathname} enabled={IDLE_PATHS.includes(pathname)} onExpire={resetOrder} />
  );
}
