"use client";

import { useState } from "react";
import { createPortal } from "react-dom";
import styles from "./demo-terminal.module.css";

type DemoTerminalProps = {
  orderId: string;
  orderNumber: number;
  amountMinor: number;
  active: boolean;
};

type LastResult = "approved" | "declined" | "no pending payment" | "request failed" | null;

/** A developer tool standing in for the card terminal under the kiosk screen.
 *  Portalled to <body> so it sits outside the scaled kiosk frame, like browser
 *  devtools rather than part of the product. It only talks to the server. */
export function DemoTerminal({ orderId, orderNumber, amountMinor, active }: DemoTerminalProps) {
  const [sending, setSending] = useState(false);
  const [lastResult, setLastResult] = useState<LastResult>(null);

  async function report(result: "approved" | "declined") {
    setSending(true);
    try {
      const response = await fetch("/api/terminal", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderId, result }),
      });
      const { settled } = (await response.json()) as { settled?: boolean };
      setLastResult(settled ? result : "no pending payment");
    } catch {
      setLastResult("request failed");
    } finally {
      setSending(false);
    }
  }

  const disabled = !active || sending;

  let status = "idle";
  if (active) status = "waiting for card";
  if (sending) status = "sending…";

  return createPortal(
    <aside className={styles.panel} aria-label="Payment terminal simulator">
      <header className={styles.titleBar}>
        <span className={styles.dot} data-active={active} />
        terminal-simulator
        <span className={styles.badge}>dev</span>
      </header>

      <dl className={styles.fields}>
        <dt>order</dt>
        <dd>#{orderNumber}</dd>
        <dt>id</dt>
        <dd title={orderId}>{orderId.slice(0, 8)}…</dd>
        <dt>amount</dt>
        <dd>{amountMinor} øre</dd>
        <dt>status</dt>
        <dd>{status}</dd>
        {lastResult && (
          <>
            <dt>last</dt>
            <dd>{lastResult}</dd>
          </>
        )}
      </dl>

      <div className={styles.actions}>
        <button
          type="button"
          className={styles.button}
          data-variant="approve"
          disabled={disabled}
          onClick={() => report("approved")}
        >
          approve
        </button>
        <button
          type="button"
          className={styles.button}
          data-variant="decline"
          disabled={disabled}
          onClick={() => report("declined")}
        >
          decline
        </button>
      </div>
    </aside>,
    document.body,
  );
}
