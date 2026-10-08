"use client";

import Link from "next/link";
import { useLayoutEffect } from "react";
import { ArrowRightIcon } from "@/components/kiosk/icons";
import { useKiosk } from "@/components/kiosk/kiosk-provider";
import styles from "./welcome.module.css";

export default function WelcomePage() {
  const { dispatch, t } = useKiosk();

  useLayoutEffect(() => {
    dispatch({ type: "RESET" });
  }, [dispatch]);

  return (
    <main className={styles.screen}>
      <div className={styles.sun} aria-hidden="true" />
      <div className={styles.ring} aria-hidden="true" />

      <h1 className={styles.title}>
        {t.welcomeTitle.map((line) => (
          <span key={line} className={styles.titleLine}>
            {line}
          </span>
        ))}
      </h1>
      <p className={styles.lead}>{t.welcomeLead}</p>

      <Link href="/mode" className={styles.start}>
        <span>{t.start}</span>
        <span className={styles.startIcon}>
          <ArrowRightIcon size={52} />
        </span>
      </Link>
    </main>
  );
}
