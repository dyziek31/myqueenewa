export const STORAGE_KEYS = {
  chat: "myqueenewa:chat",
  payments: "myqueenewa:payments",
  trip: "myqueenewa:trip",
  ideas: "myqueenewa:ideas",
  chatAuthor: "myqueenewa:chat-author",
} as const;

function isBrowser(): boolean {
  return typeof window !== "undefined";
}

export function readFromStorage<T>(key: string, fallback: T): T {
  if (!isBrowser()) return fallback;
  try {
    const raw = window.localStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

/** Throws when the browser storage is full (e.g. too many photos). */
export function writeToStorage<T>(key: string, value: T): void {
  if (!isBrowser()) return;
  window.localStorage.setItem(key, JSON.stringify(value));
}
