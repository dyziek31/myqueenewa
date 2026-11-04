"use client";

import { createCollection } from "@/lib/collection";
import { STORAGE_KEYS } from "@/lib/storage";
import type { ChatMessage, Idea, Payment, TripCost } from "@/types";

export const chat = createCollection<ChatMessage>(STORAGE_KEYS.chat);
export const payments = createCollection<Payment>(STORAGE_KEYS.payments);
export const trip = createCollection<TripCost>(STORAGE_KEYS.trip);
export const ideas = createCollection<Idea>(STORAGE_KEYS.ideas);

export function isQuotaError(error: unknown): boolean {
  return (
    error instanceof DOMException &&
    (error.name === "QuotaExceededError" || error.name === "NS_ERROR_DOM_QUOTA_REACHED")
  );
}
