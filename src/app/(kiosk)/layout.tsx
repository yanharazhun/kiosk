import { connection } from "next/server";
import type { ReactNode } from "react";
import { KioskFrame } from "@/components/kiosk/kiosk-frame";
import { KioskHeader } from "@/components/kiosk/kiosk-header";
import { KioskIdleGuard } from "@/components/kiosk/kiosk-idle-guard";
import { KioskProvider } from "@/components/kiosk/kiosk-provider";
import { getMenu } from "@/lib/menu/get-menu";

export default async function KioskLayout({
  children,
}: Readonly<{ children: ReactNode }>) {
  await connection();
  const menu = await getMenu();

  return (
    <KioskProvider menu={menu}>
      <KioskFrame>
        <KioskHeader />
        {children}
        <KioskIdleGuard />
      </KioskFrame>
    </KioskProvider>
  );
}
