import { useSyncExternalStore } from "react";

const TICK_MS = 15_000;

const listeners = new Set<() => void>();
let offsetMs = 0;
let now = 0;
let timer: ReturnType<typeof setInterval> | undefined;

function tick() {
  now = Date.now() + offsetMs;
  listeners.forEach((listener) => listener());
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  if (!timer) {
    tick();
    timer = setInterval(tick, TICK_MS);
  }
  return () => {
    listeners.delete(listener);
    if (listeners.size === 0) {
      clearInterval(timer);
      timer = undefined;
    }
  };
}

export function syncServerClock(serverNow: string) {
  offsetMs = Date.parse(serverNow) - Date.now();
  tick();
}

export function useNow(): number | null {
  return useSyncExternalStore(
    subscribe,
    () => (now === 0 ? null : now),
    () => null,
  );
}
