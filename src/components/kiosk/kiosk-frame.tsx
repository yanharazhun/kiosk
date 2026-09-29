"use client";

import { useSyncExternalStore, type CSSProperties, type ReactNode } from "react";
import styles from "./kiosk-frame.module.css";

const DESIGN_WIDTH = 1080;
const DESIGN_HEIGHT = 1920;

function subscribe(onChange: () => void) {
  window.addEventListener("resize", onChange);
  return () => window.removeEventListener("resize", onChange);
}

function getScale() {
  return Math.min(
    window.innerWidth / DESIGN_WIDTH,
    window.innerHeight / DESIGN_HEIGHT,
  );
}

function getServerScale() {
  return 0;
}

export function KioskFrame({ children }: { children: ReactNode }) {
  const scale = useSyncExternalStore(subscribe, getScale, getServerScale);

  return (
    <div className={styles.viewport}>
      <div
        className={styles.frame}
        style={{ "--kiosk-scale": scale } as CSSProperties}
        data-ready={scale > 0}
      >
        {children}
      </div>
    </div>
  );
}
