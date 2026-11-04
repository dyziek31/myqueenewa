import { readFromStorage, writeToStorage } from "@/lib/storage";

type Listener = () => void;

interface StorageStore<T> {
  getSnapshot: () => T;
  getServerSnapshot: () => T;
  subscribe: (listener: Listener) => () => void;
  set: (value: T) => void;
  invalidate: () => void;
}

const stores = new Map<string, StorageStore<unknown>>();

export function getStorageStore<T>(key: string, fallback: T): StorageStore<T> {
  const existing = stores.get(key);
  if (existing) return existing as StorageStore<T>;

  const listeners = new Set<Listener>();
  let cached: T = typeof window === "undefined" ? fallback : readFromStorage<T>(key, fallback);

  function notify(): void {
    listeners.forEach((listener) => listener());
  }

  const store: StorageStore<T> = {
    getSnapshot: () => cached,
    getServerSnapshot: () => fallback,
    subscribe(listener) {
      listeners.add(listener);
      return () => listeners.delete(listener);
    },
    set(value) {
      // Write first so a full storage leaves the in-memory state unchanged.
      writeToStorage(key, value);
      cached = value;
      notify();
    },
    invalidate() {
      cached = readFromStorage<T>(key, fallback);
      notify();
    },
  };

  if (typeof window !== "undefined") {
    // Keep several open tabs in sync.
    window.addEventListener("storage", (event) => {
      if (event.key === key) store.invalidate();
    });
  }

  stores.set(key, store as StorageStore<unknown>);
  return store;
}
