"use client";

import { useEffect, useState } from "react";
import styles from "./error.module.css";

const RETRY_DELAYS_SECONDS = [5, 10, 30, 60];

type KioskErrorProps = {
  error: Error & { digest?: string };
  retry: () => void;
};

export default function KioskError({ error, retry }: KioskErrorProps) {
  const [attempt, setAttempt] = useState(0);
  const delay =
    RETRY_DELAYS_SECONDS[Math.min(attempt, RETRY_DELAYS_SECONDS.length - 1)];

  useEffect(() => {
    console.error(error);
  }, [error]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setAttempt((value) => value + 1);
      retry();
    }, delay * 1000);
    return () => clearTimeout(timer);
  }, [attempt, delay, retry]);

  return (
    <main className={styles.screen}>
      <h1 className={styles.title}>Kiosk temporarily unavailable</h1>
      <p className={styles.subtitle}>Kiosken er midlertidigt utilgængelig</p>
      <p className={styles.hint}>
        Retrying in {delay} s · Prøver igen om {delay} s
      </p>
      <button type="button" className={styles.button} onClick={retry}>
        Try again · Prøv igen
      </button>
    </main>
  );
}
