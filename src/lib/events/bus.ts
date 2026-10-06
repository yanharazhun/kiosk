import "server-only";
import { EventEmitter } from "node:events";
import type { AppEvent } from "./types";

type Listener = (event: AppEvent) => void;

const CHANNEL = "app-event";

const store = globalThis as unknown as { eventBus?: EventEmitter };

function createBus(): EventEmitter {
  const bus = new EventEmitter();
  bus.setMaxListeners(0);
  return bus;
}

const bus = (store.eventBus ??= createBus());

export function publish(event: AppEvent): void {
  bus.emit(CHANNEL, event);
}

export function subscribe(listener: Listener): () => void {
  bus.on(CHANNEL, listener);
  return () => bus.off(CHANNEL, listener);
}
