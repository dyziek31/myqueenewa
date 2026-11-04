export type ChatAuthor = "ja" | "ewa";

export interface ChatMessage {
  id: string;
  author: ChatAuthor;
  text: string;
  /** Compressed JPEG data URL, if a photo was attached. */
  image?: string;
  createdAt: string;
}

export interface Payment {
  id: string;
  date: string; // yyyy-mm-dd
  name: string;
  amount: number;
  createdAt: string;
}

export interface TripCost {
  id: string;
  name: string;
  amount: number;
  paid: boolean;
  createdAt: string;
}

export interface Idea {
  id: string;
  text: string;
  done: boolean;
  createdAt: string;
}

export const AUTHOR_LABELS: Record<ChatAuthor, string> = {
  ja: "Ja",
  ewa: "Ewa",
};
