"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import { locales } from "@/lib/i18n/locale";
import { LogoMark } from "./icons";
import { useKiosk } from "./kiosk-provider";
import styles from "./kiosk-header.module.css";

export function KioskHeader() {
  const pathname = usePathname();
  const { state, dispatch, t, resetOrder } = useKiosk();
  const isWelcome = pathname === "/";
  const showServiceType = state.serviceType !== null && pathname !== "/mode";

  return (
    <header className={styles.header} data-tone={isWelcome ? "brand" : "plain"}>
      <div className={styles.brand}>
        <LogoMark
          size={isWelcome ? 64 : 48}
          fill={isWelcome ? "var(--color-surface)" : "var(--color-accent)"}
        />
        <span className={styles.brandName}>{t.brand}</span>
      </div>

      <div className={styles.actions}>
        {showServiceType && (
          <Link href="/mode" className={styles.chip}>
            <span>{state.serviceType === "EAT_IN" ? t.eatIn : t.takeAway}</span>
            <span className={styles.chipAction}>{t.change}</span>
          </Link>
        )}

        {!isWelcome && (
          <button type="button" className={styles.outline} onClick={resetOrder}>
            {t.startOver}
          </button>
        )}

        <div className={styles.locales} role="group" aria-label="Language">
          {locales.map((locale) => (
            <button
              key={locale}
              type="button"
              className={styles.locale}
              aria-pressed={state.locale === locale}
              onClick={() => dispatch({ type: "SET_LOCALE", locale })}
            >
              {locale.toUpperCase()}
            </button>
          ))}
        </div>
      </div>
    </header>
  );
}
