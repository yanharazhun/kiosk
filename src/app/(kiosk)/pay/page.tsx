"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import type { PaymentMethod } from "@/generated/prisma/enums";
import { ArrowLeftIcon, CardIcon, CashIcon } from "@/components/kiosk/icons";
import { useKiosk } from "@/components/kiosk/kiosk-provider";
import { formatPrice } from "@/lib/money";
import { cartSummary } from "@/lib/order/cart";
import { placeOrderAction } from "./actions";
import styles from "./pay.module.css";

type PayError = "unavailable" | "failed" | null;

export default function PayPage() {
  const router = useRouter();
  const { menu, state, dispatch, t } = useKiosk();
  const [submitting, setSubmitting] = useState<PaymentMethod | null>(null);
  const [error, setError] = useState<PayError>(null);

  const isEmpty = state.items.length === 0;

  useEffect(() => {
    if (state.serviceType === null) router.replace("/");
    else if (isEmpty) router.replace("/cart");
  }, [state.serviceType, isEmpty, router]);

  if (state.serviceType === null || isEmpty) return null;
  const serviceType = state.serviceType;

  const { totalMinor } = cartSummary(menu, state.items);

  async function pay(paymentMethod: PaymentMethod) {
    setSubmitting(paymentMethod);
    setError(null);
    try {
      const result = await placeOrderAction({
        serviceType,
        paymentMethod,
        locale: state.locale,
        items: state.items,
      });
      if (!result.ok) {
        setError(result.reason === "unavailable" ? "unavailable" : "failed");
        return;
      }
      dispatch({ type: "ORDER_PLACED", order: result.order });
      router.push(paymentMethod === "CARD" ? "/pay/card" : "/done");
    } catch {
      setError("failed");
    } finally {
      setSubmitting(null);
    }
  }

  return (
    <main className={styles.screen}>
      <Link href="/cart" className={styles.back}>
        <ArrowLeftIcon size={36} />
        {t.backToOrder}
      </Link>

      <div className={styles.amount}>
        <span className={styles.amountLabel}>{t.amountToPay}</span>
        <span className={styles.amountValue}>{formatPrice(totalMinor, state.locale)}</span>
      </div>

      <h1 className={styles.title}>{t.howToPay}</h1>

      {error && (
        <p className={styles.error} role="alert">
          {error === "unavailable" ? t.orderUnavailable : t.orderFailed}
        </p>
      )}

      <div className={styles.options}>
        <button
          type="button"
          className={styles.option}
          data-tone="dark"
          disabled={submitting !== null}
          onClick={() => pay("CARD")}
        >
          <span className={styles.icon} data-tone="accent">
            <CardIcon size={84} />
          </span>
          <span className={styles.text}>
            <span className={styles.label}>{t.payByCard}</span>
            <span className={styles.hint}>{t.payByCardHint}</span>
          </span>
        </button>

        <button
          type="button"
          className={styles.option}
          data-tone="light"
          disabled={submitting !== null}
          onClick={() => pay("COUNTER")}
        >
          <span className={styles.icon} data-tone="mint">
            <CashIcon size={84} />
          </span>
          <span className={styles.text}>
            <span className={styles.label}>{t.payAtCounter}</span>
            <span className={styles.hint}>{t.payAtCounterHint}</span>
          </span>
        </button>
      </div>
    </main>
  );
}
