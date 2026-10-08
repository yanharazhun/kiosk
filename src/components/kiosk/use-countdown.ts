"use client";

import { useEffect, useEffectEvent, useState } from "react";

export function useCountdown(durationMs: number, onExpire: () => void): number {
  const [secondsLeft, setSecondsLeft] = useState(Math.ceil(durationMs / 1000));
  const expire = useEffectEvent(onExpire);

  useEffect(() => {
    const timer = window.setInterval(() => {
      setSecondsLeft((seconds) => Math.max(0, seconds - 1));
    }, 1000);
    return () => window.clearInterval(timer);
  }, []);

  useEffect(() => {
    if (secondsLeft === 0) expire();
  }, [secondsLeft]);

  return secondsLeft;
}
