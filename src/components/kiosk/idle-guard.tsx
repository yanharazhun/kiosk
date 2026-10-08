"use client";

import { KIOSK_TIMEOUTS } from "@/lib/kiosk/timeouts";
import styles from "./idle-guard.module.css";
import { useKiosk } from "./kiosk-provider";
import { useCountdown } from "./use-countdown";
import { useIdle } from "./use-idle";

type IdleGuardProps = {
  enabled: boolean;
  onExpire: () => void;
};

export function IdleGuard({ enabled, onExpire }: IdleGuardProps) {
  const { isIdle, wake } = useIdle(enabled, KIOSK_TIMEOUTS.idleMs);
  if (!isIdle) return null;
  return <StillThereDialog onStay={wake} onLeave={onExpire} />;
}

type StillThereDialogProps = {
  onStay: () => void;
  onLeave: () => void;
};

function StillThereDialog({ onStay, onLeave }: StillThereDialogProps) {
  const { t } = useKiosk();
  const secondsLeft = useCountdown(KIOSK_TIMEOUTS.stillThereMs, onLeave);

  return (
    <div className={styles.overlay}>
      <button
        type="button"
        className={styles.scrim}
        aria-label={t.stillHere}
        tabIndex={-1}
        onClick={onStay}
      />

      <div
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="still-there-title"
        aria-describedby="still-there-text"
        className={styles.dialog}
      >
        <span className={styles.seconds} aria-hidden="true">
          {secondsLeft}
        </span>
        <h2 id="still-there-title" className={styles.title}>
          {t.stillThere}
        </h2>
        <p id="still-there-text" className={styles.text}>
          {t.orderClearedIn(secondsLeft)}
        </p>

        <div className={styles.actions}>
          <button type="button" className={styles.leave} onClick={onLeave}>
            {t.startOver}
          </button>
          <button type="button" className={styles.stay} onClick={onStay} autoFocus>
            {t.stillHere}
          </button>
        </div>
      </div>
    </div>
  );
}
