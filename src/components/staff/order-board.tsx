"use client";

import { useEffect, useState, useTransition } from "react";
import type { OrderStatus } from "@/generated/prisma/enums";
import type { Locale } from "@/lib/i18n/locale";
import { localize } from "@/lib/i18n/localized-text";
import { staffMessages } from "@/lib/i18n/staff-messages";
import { formatPrice } from "@/lib/money";
import type { StaffTarget } from "@/lib/order/transitions";
import { changeOrderStatus } from "@/lib/staff/actions";
import type { StaffOrder, StaffOrders } from "@/lib/staff/types";
import { ConfirmDialog } from "./confirm-dialog";
import { actionLabels, confirmTitles } from "./labels";
import { OrderCard } from "./order-card";
import styles from "./order-board.module.css";
import { syncServerClock, useNow } from "./use-now";

type OrderBoardProps = {
  data: StaffOrders;
  locale: Locale;
};

type PendingConfirm = { order: StaffOrder; to: StaffTarget };

type ColumnTitle = "awaitingPayment" | "new" | "preparing" | "ready";

const COLUMNS: { status: OrderStatus; title: ColumnTitle }[] = [
  { status: "PENDING_PAYMENT", title: "awaitingPayment" },
  { status: "PAID", title: "new" },
  { status: "PREPARING", title: "preparing" },
  { status: "READY", title: "ready" },
];

const CONFIRMED_TARGETS: StaffTarget[] = ["PAID", "CANCELLED", "COMPLETED"];

export function OrderBoard({ data, locale }: OrderBoardProps) {
  const t = staffMessages[locale];
  const now = useNow();
  const [confirm, setConfirm] = useState<PendingConfirm | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    syncServerClock(data.serverNow);
  }, [data.serverNow]);

  function run(order: StaffOrder, to: StaffTarget) {
    setConfirm(null);
    setNotice(null);
    startTransition(async () => {
      const result = await changeOrderStatus({ orderId: order.id, to });
      if (!result.ok) setNotice(t.conflict);
    });
  }

  function request(order: StaffOrder, to: StaffTarget) {
    if (CONFIRMED_TARGETS.includes(to)) setConfirm({ order, to });
    else run(order, to);
  }

  const labels = actionLabels(t);
  const titles = confirmTitles(t);

  return (
    <div className={styles.board}>
      {notice && (
        <p className={styles.notice} role="status">
          {notice}
        </p>
      )}

      <div className={styles.columns}>
        {COLUMNS.map((column) => {
          const orders = data.orders.filter((order) => order.status === column.status);
          return (
            <section key={column.status} className={styles.column}>
              <h2 className={styles.columnTitle}>
                {t[column.title]}
                <span className={styles.count}>{orders.length}</span>
              </h2>
              <div className={styles.cards}>
                {orders.length === 0 ? (
                  <p className={styles.empty}>{t.noOrders}</p>
                ) : (
                  orders.map((order) => (
                    <OrderCard
                      key={order.id}
                      order={order}
                      now={now}
                      locale={locale}
                      t={t}
                      disabled={isPending}
                      onAction={(to) => request(order, to)}
                    />
                  ))
                )}
              </div>
            </section>
          );
        })}
      </div>

      {confirm && (
        <ConfirmDialog
          title={titles[confirm.to]?.(confirm.order.number) ?? ""}
          lines={confirm.order.items.map(
            (item) => `${item.quantity} × ${localize(item.name, locale)}`,
          )}
          detail={
            confirm.to === "PAID"
              ? formatPrice(confirm.order.totalMinor, locale)
              : undefined
          }
          cancelLabel={t.back}
          confirmLabel={labels[confirm.to]}
          tone={confirm.to === "CANCELLED" ? "danger" : "default"}
          onCancel={() => setConfirm(null)}
          onConfirm={() => run(confirm.order, confirm.to)}
        />
      )}
    </div>
  );
}
