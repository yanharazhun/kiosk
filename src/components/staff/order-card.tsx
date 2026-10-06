import type { Locale } from "@/lib/i18n/locale";
import { localize } from "@/lib/i18n/localized-text";
import type { StaffMessages } from "@/lib/i18n/staff-messages";
import { formatPrice } from "@/lib/money";
import { staffTransitions, type StaffTarget } from "@/lib/order/transitions";
import type { StaffOrder } from "@/lib/staff/types";
import { actionLabels } from "./labels";
import styles from "./order-card.module.css";

type OrderCardProps = {
  order: StaffOrder;
  now: number | null;
  locale: Locale;
  t: StaffMessages;
  disabled: boolean;
  onAction: (to: StaffTarget) => void;
};

function formatElapsed(since: string, now: number | null, t: StaffMessages): string {
  if (now === null) return "—";
  const minutes = Math.floor((now - Date.parse(since)) / 60_000);
  if (minutes < 1) return t.lessThanMinute;
  if (minutes < 60) return t.minutes(minutes);
  return t.hours(Math.floor(minutes / 60), String(minutes % 60).padStart(2, "0"));
}

function paymentLabel(order: StaffOrder, locale: Locale, t: StaffMessages): string {
  if (order.status === "PENDING_PAYMENT") return t.collect(formatPrice(order.totalMinor, locale));
  return order.paymentMethod === "CARD" ? t.paidByCard : t.paidAtCounter;
}

export function OrderCard({ order, now, locale, t, disabled, onAction }: OrderCardProps) {
  const [primary, ...secondary] = staffTransitions(order.status, order.paymentMethod);
  const labels = actionLabels(t);
  const since = order.status === "PENDING_PAYMENT" ? order.createdAt : (order.paidAt ?? order.createdAt);

  return (
    <article className={styles.card} data-status={order.status}>
      <header className={styles.header}>
        <span className={styles.number}>#{order.number}</span>
        <span className={styles.elapsed}>{formatElapsed(since, now, t)}</span>
      </header>

      <p className={styles.meta}>
        {order.serviceType === "TAKE_AWAY" ? t.takeAway : t.eatIn}
        {" · "}
        <span className={styles.payment}>{paymentLabel(order, locale, t)}</span>
      </p>

      <ul className={styles.items}>
        {order.items.map((item) => (
          <li key={item.id} className={styles.item}>
            <span className={styles.itemName}>
              {item.quantity} × {localize(item.name, locale)}
            </span>
            {item.modifiers.map((modifier) => (
              <span key={modifier.id} className={styles.modifier} data-kind={modifier.kind}>
                {modifier.kind === "REMOVE" ? "−" : "+"} {localize(modifier.name, locale)}
                {modifier.quantity > 1 && ` ×${modifier.quantity}`}
              </span>
            ))}
          </li>
        ))}
      </ul>

      {primary && (
        <footer className={styles.actions}>
          {secondary.map((to) => (
            <button
              key={to}
              type="button"
              className={styles.secondary}
              disabled={disabled}
              onClick={() => onAction(to)}
            >
              {labels[to]}
            </button>
          ))}
          <button
            type="button"
            className={styles.primary}
            disabled={disabled}
            onClick={() => onAction(primary)}
          >
            {labels[primary]}
          </button>
        </footer>
      )}
    </article>
  );
}
