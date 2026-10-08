"use client";

import { useCallback, useEffect, useState } from "react";

const ACTIVITY_EVENTS = ["pointerdown", "keydown", "wheel"] as const;

export function useIdle(enabled: boolean, timeoutMs: number) {
  const [isIdle, setIsIdle] = useState(false);

  useEffect(() => {
    if (!enabled || isIdle) return;

    let timer = window.setTimeout(() => setIsIdle(true), timeoutMs);
    function restart() {
      window.clearTimeout(timer);
      timer = window.setTimeout(() => setIsIdle(true), timeoutMs);
    }

    for (const type of ACTIVITY_EVENTS) {
      window.addEventListener(type, restart, { capture: true, passive: true });
    }
    return () => {
      window.clearTimeout(timer);
      for (const type of ACTIVITY_EVENTS) {
        window.removeEventListener(type, restart, { capture: true });
      }
    };
  }, [enabled, isIdle, timeoutMs]);

  const wake = useCallback(() => setIsIdle(false), []);

  return { isIdle: enabled && isIdle, wake };
}
