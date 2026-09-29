"use client";

import { useRouter } from "next/navigation";
import type { ServiceType } from "@/generated/prisma/enums";
import { BagIcon, TrayIcon } from "@/components/kiosk/icons";
import { useKiosk } from "@/components/kiosk/kiosk-provider";
import styles from "./mode.module.css";

export default function ModePage() {
  const router = useRouter();
  const { dispatch, t } = useKiosk();

  function choose(serviceType: ServiceType) {
    dispatch({ type: "SET_SERVICE_TYPE", serviceType });
    router.push("/menu");
  }

  return (
    <main className={styles.screen}>
      <h1 className={styles.title}>{t.modeTitle}</h1>
      <div className={styles.options}>
        <button type="button" className={styles.option} onClick={() => choose("EAT_IN")}>
          <span className={styles.icon} data-tone="accent">
            <TrayIcon size={120} />
          </span>
          <span className={styles.text}>
            <span className={styles.label}>{t.eatIn}</span>
            <span className={styles.hint}>{t.eatInHint}</span>
          </span>
        </button>
        <button type="button" className={styles.option} onClick={() => choose("TAKE_AWAY")}>
          <span className={styles.icon} data-tone="mint">
            <BagIcon size={112} />
          </span>
          <span className={styles.text}>
            <span className={styles.label}>{t.takeAway}</span>
            <span className={styles.hint}>{t.takeAwayHint}</span>
          </span>
        </button>
      </div>
    </main>
  );
}
