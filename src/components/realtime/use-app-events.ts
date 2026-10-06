"use client";

import { useEffect, useEffectEvent, useState } from "react";
import type { AppEvent } from "@/lib/events/types";

export type ConnectionStatus = "connecting" | "live" | "offline";

type AppEventHandlers = {
  onEvent: (event: AppEvent) => void;
  onReconnect: () => void;
};

export function useAppEvents({ onEvent, onReconnect }: AppEventHandlers): ConnectionStatus {
  const [status, setStatus] = useState<ConnectionStatus>("connecting");
  const handleEvent = useEffectEvent(onEvent);
  const handleReconnect = useEffectEvent(onReconnect);

  useEffect(() => {
    const source = new EventSource("/api/events");
    let wasOpen = false;

    source.onopen = () => {
      setStatus("live");
      if (wasOpen) handleReconnect();
      wasOpen = true;
    };
    source.onerror = () => setStatus("offline");
    source.onmessage = (message) => handleEvent(message.data as AppEvent);

    return () => source.close();
  }, []);

  return status;
}
