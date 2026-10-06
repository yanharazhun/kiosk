"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useTransition } from "react";
import { LogoMark } from "@/components/kiosk/icons";
import { useAppEvents } from "@/components/realtime/use-app-events";
import { locales, type Locale } from "@/lib/i18n/locale";
import { staffMessages } from "@/lib/i18n/staff-messages";
import { setStaffLocale } from "@/lib/staff/actions";
import styles from "./staff-header.module.css";
import { useNow } from "./use-now";

type StaffHeaderProps = {
  locale: Locale;
};

const tabs = [
  { href: "/staff", label: "orders" },
  { href: "/staff/stop-list", label: "stopList" },
] as const;

function formatClock(now: number | null): string {
  if (now === null) return "--:--";
  return new Intl.DateTimeFormat("da-DK", {
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "Europe/Copenhagen",
  }).format(now);
}

export function StaffHeader({ locale }: StaffHeaderProps) {
  const t = staffMessages[locale];
  const pathname = usePathname();
  const router = useRouter();
  const now = useNow();
  const [isPending, startTransition] = useTransition();
  const connection = useAppEvents({
    onEvent: () => router.refresh(),
    onReconnect: () => router.refresh(),
  });

  return (
    <header className={styles.header}>
      <div className={styles.brand}>
        <LogoMark size={36} fill="var(--color-accent)" />
        <span className={styles.brandName}>Ember &amp; Bun</span>
        <span className={styles.badge}>{t.title}</span>
      </div>

      <nav className={styles.tabs}>
        {tabs.map((tab) => (
          <Link
            key={tab.href}
            href={tab.href}
            className={styles.tab}
            aria-current={pathname === tab.href ? "page" : undefined}
          >
            {t[tab.label]}
          </Link>
        ))}
      </nav>

      <div className={styles.side}>
        <span className={styles.connection} data-status={connection}>
          {t.connection[connection]}
        </span>
        <div className={styles.locales} role="group" aria-label={t.language}>
          {locales.map((option) => (
            <button
              key={option}
              type="button"
              className={styles.locale}
              aria-pressed={option === locale}
              disabled={isPending}
              onClick={() => startTransition(() => setStaffLocale(option))}
            >
              {option.toUpperCase()}
            </button>
          ))}
        </div>
        <span className={styles.clock}>{formatClock(now)}</span>
      </div>
    </header>
  );
}
