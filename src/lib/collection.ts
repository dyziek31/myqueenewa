"use client";

import { useSyncExternalStore } from "react";
import { getStorageStore } from "@/lib/externalStore";
import { generateId } from "@/lib/id";

interface WithId {
  id: string;
  createdAt: string;
}

/** Small CRUD helper over a list persisted in localStorage. */
export function createCollection<T extends WithId>(key: string) {
  const empty: T[] = [];
  const store = getStorageStore<T[]>(key, empty);

  return {
    add(input: Omit<T, "id" | "createdAt">): T {
      const item = {
        ...input,
        id: generateId(),
        createdAt: new Date().toISOString(),
      } as T;
      store.set([...store.getSnapshot(), item]);
      return item;
    },
    update(id: string, patch: Partial<Omit<T, "id" | "createdAt">>): void {
      store.set(
        store.getSnapshot().map((item) => (item.id === id ? { ...item, ...patch } : item)),
      );
    },
    remove(id: string): void {
      store.set(store.getSnapshot().filter((item) => item.id !== id));
    },
    useItems(): T[] {
      return useSyncExternalStore(store.subscribe, store.getSnapshot, store.getServerSnapshot);
    },
  };
}
