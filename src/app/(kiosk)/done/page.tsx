"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { CheckIcon } from "@/components/kiosk/icons";
import { useKiosk } from "@/components/kiosk/kiosk-provider";
import { useCountdown } from "@/components/kiosk/use-countdown";
import { KIOSK_TIMEOUTS } from "@/lib/kiosk/timeouts";
import { formatPrice } from "@/lib/money";
import styles from "./done.module.css";

export default function DonePage() {
  const router = useRouter();
  const { state, t, resetOrder } = useKiosk();
  const order = state.placedOrder;
  const secondsLeft = useCountdown(KIOSK_TIMEOUTS.doneScreenMs, resetOrder);

  useEffect(() => {
    if (!order) router.replace("/");
  }, [order, router]);

  if (!order) return null;

  const isCounter = order.paymentMethod === "COUNTER";
  const isTakeAway = state.serviceType === "TAKE_AWAY";

  let message = isTakeAway ? t.donePaidTakeAway : t.donePaidEatIn;
  if (isCounter) message = t.donePayAtCounter;

  const count = state.items.reduce((sum, item) => sum + item.quantity, 0);
  const mode = isTakeAway ? t.takeAway : t.eatIn;

  return (
    <main className={styles.screen}>
      <div className={styles.sun} aria-hidden="true" />

      <span className={styles.check} aria-hidden="true">
        <CheckIcon size={64} />
      </span>
      <h1 className={styles.title}>{isCounter ? t.almostThere : t.thankYou}</h1>

      <div className={styles.ticket}>
        <span className={styles.ticketLabel}>{t.yourNumber}</span>
        <span className={styles.number}>{order.number}</span>
        <span className={styles.summary}>
          {mode} · {t.itemCount(count)} · {formatPrice(order.totalMinor, state.locale)}
        </span>
      </div>

      <p className={styles.message}>{message}</p>

      <div className={styles.spacer} />

      <div className={styles.footer}>
        <span className={styles.countdown}>{t.backToStartIn(secondsLeft)}</span>
        <button type="button" className={styles.done} onClick={resetOrder}>
          {t.done}
        </button>
      </div>
    </main>
  );
}
