"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { DemoTerminal } from "@/components/kiosk/demo-terminal";
import { ArrowDownIcon } from "@/components/kiosk/icons";
import { IdleGuard } from "@/components/kiosk/idle-guard";
import { useKiosk } from "@/components/kiosk/kiosk-provider";
import { formatPrice } from "@/lib/money";
import type { PaymentStatus } from "@/lib/order/types";
import styles from "./card.module.css";

type Phase = "waiting" | "declined" | "timeout" | "error";

export default function CardPaymentPage() {
  const router = useRouter();
  const { state, dispatch, t, resetOrder } = useKiosk();
  const [phase, setPhase] = useState<Phase>("waiting");
  const [attempt, setAttempt] = useState(0);

  const order = state.placedOrder?.paymentMethod === "CARD" ? state.placedOrder : null;
  const orderId = order?.id;

  useEffect(() => {
    if (!orderId) router.replace("/pay");
  }, [orderId, router]);

  // Parks a request on the server until the terminal answers. Leaving the screen
  // aborts it, so the server stops waiting instead of holding it until the timeout.
  useEffect(() => {
    if (!orderId) return;
    const controller = new AbortController();

    fetch("/api/payments", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ orderId }),
      signal: controller.signal,
    })
      .then((response) => response.json() as Promise<{ status?: PaymentStatus }>)
      .then(({ status }) => {
        switch (status) {
          case "approved":
            router.replace("/done");
            break;
          case "declined":
          case "timeout":
            setPhase(status);
            break;
          case "cancelled": // Cancel already navigated away
          case "superseded": // a newer attempt took over
            break;
          default:
            setPhase("error");
        }
      })
      .catch(() => {
        if (!controller.signal.aborted) setPhase("error");
      });

    return () => controller.abort();
  }, [orderId, attempt, router]);

  if (!order) return null;

  function retry() {
    setPhase("waiting");
    setAttempt((value) => value + 1);
  }

  async function cancelPayment() {
    if (!order) return;
    await fetch("/api/payments/cancel", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ orderId: order.id }),
    }).catch(() => undefined);
  }

  async function cancel() {
    await cancelPayment();
    dispatch({ type: "ORDER_CANCELLED" });
    router.replace("/pay");
  }

  async function abandon() {
    await cancelPayment();
    resetOrder();
  }

  const titles: Record<Phase, string> = {
    waiting: t.tapCard,
    declined: t.paymentDeclined,
    timeout: t.paymentTimedOut,
    error: t.paymentError,
  };
  const title = titles[phase];

  return (
    <main className={styles.screen}>
      <span className={styles.amountLabel}>{t.amountDue}</span>
      <span className={styles.amount}>{formatPrice(order.totalMinor, state.locale)}</span>

      <h1 className={styles.title}>{title}</h1>
      <p className={styles.hint}>{phase === "waiting" ? t.useTerminal : t.noMoneyTaken}</p>

      {phase === "waiting" ? (
        <span className={styles.nudge} aria-hidden="true">
          <ArrowDownIcon size={88} />
        </span>
      ) : (
        <button type="button" className={styles.retry} onClick={retry}>
          {t.tryAgain}
        </button>
      )}

      <div className={styles.spacer} />

      <button type="button" className={styles.cancel} onClick={cancel}>
        {t.cancel}
      </button>

      <DemoTerminal
        orderId={order.id}
        orderNumber={order.number}
        amountMinor={order.totalMinor}
        active={phase === "waiting"}
      />

      <IdleGuard enabled={phase !== "waiting"} onExpire={abandon} />
    </main>
  );
}
