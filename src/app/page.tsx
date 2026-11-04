"use client";

import { useEffect, useRef, useState, useSyncExternalStore, type FormEvent } from "react";
import { CloseIcon, ImageIcon, SendIcon, TrashIcon } from "@/components/layout/icons";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { cn } from "@/lib/cn";
import { chat, isQuotaError } from "@/lib/data";
import { getStorageStore } from "@/lib/externalStore";
import { compressImage } from "@/lib/image";
import { STORAGE_KEYS } from "@/lib/storage";
import { AUTHOR_LABELS, type ChatAuthor } from "@/types";

const authorStore = getStorageStore<ChatAuthor>(STORAGE_KEYS.chatAuthor, "ja");

function formatTime(iso: string): string {
  return new Intl.DateTimeFormat("pl-PL", {
    day: "2-digit",
    month: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(iso));
}

export default function ChatPage() {
  const messages = chat.useItems();
  const author = useSyncExternalStore(
    authorStore.subscribe,
    authorStore.getSnapshot,
    authorStore.getServerSnapshot,
  );

  const [text, setText] = useState("");
  const [image, setImage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);
  const [toDelete, setToDelete] = useState<string | null>(null);

  const fileRef = useRef<HTMLInputElement>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ block: "end" });
  }, [messages.length]);

  async function onPickImage(file: File | undefined) {
    if (!file) return;
    setError(null);
    setBusy(true);
    try {
      setImage(await compressImage(file));
    } catch {
      setError("Nie udało się wczytać zdjęcia.");
    } finally {
      setBusy(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  }

  function onSubmit(event: FormEvent) {
    event.preventDefault();
    const trimmed = text.trim();
    if (!trimmed && !image) return;
    try {
      chat.add({ author, text: trimmed, ...(image ? { image } : {}) });
      setText("");
      setImage(null);
      setError(null);
    } catch (err) {
      setError(
        isQuotaError(err)
          ? "Brak miejsca w pamięci przeglądarki — usuń kilka starszych zdjęć."
          : "Nie udało się wysłać wiadomości.",
      );
    }
  }

  return (
    <div className="flex flex-col">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-semibold tracking-tight">Chat</h1>
        <div className="flex items-center gap-2 text-sm text-muted">
          Piszesz jako
          <div className="flex rounded-full border border-border p-0.5">
            {(Object.keys(AUTHOR_LABELS) as ChatAuthor[]).map((a) => (
              <button
                key={a}
                type="button"
                onClick={() => authorStore.set(a)}
                className={cn(
                  "rounded-full px-3 py-1 text-xs font-medium transition-colors",
                  author === a ? "bg-accent text-background" : "text-muted hover:text-foreground",
                )}
              >
                {AUTHOR_LABELS[a]}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="flex min-h-[50dvh] flex-col gap-3 rounded-2xl border border-border bg-surface p-4">
        {messages.length === 0 && (
          <p className="m-auto text-center text-sm text-muted">
            Brak wiadomości. Napisz coś miłego 💌
          </p>
        )}
        {messages.map((m) => {
          const mine = m.author === author;
          return (
            <div key={m.id} className={cn("group flex flex-col", mine ? "items-end" : "items-start")}>
              <div
                className={cn(
                  "max-w-[80%] overflow-hidden rounded-2xl text-sm",
                  mine
                    ? "rounded-br-sm bg-accent text-background"
                    : "rounded-bl-sm bg-surface-hover text-foreground",
                )}
              >
                {m.image && (
                  <button type="button" onClick={() => setPreview(m.image!)} className="block">
                    {/* eslint-disable-next-line @next/next/no-img-element -- local data URL */}
                    <img src={m.image} alt="Zdjęcie" className="max-h-72 w-full object-cover" />
                  </button>
                )}
                {m.text && <p className="px-3.5 py-2 break-words whitespace-pre-wrap">{m.text}</p>}
              </div>
              <div className="mt-1 flex items-center gap-2 text-[11px] text-muted">
                <span>
                  {AUTHOR_LABELS[m.author]} · {formatTime(m.createdAt)}
                </span>
                <button
                  type="button"
                  aria-label="Usuń wiadomość"
                  onClick={() => setToDelete(m.id)}
                  className="opacity-60 hover:text-danger hover:opacity-100 md:opacity-0 md:group-hover:opacity-100"
                >
                  <TrashIcon width={14} height={14} />
                </button>
              </div>
            </div>
          );
        })}
        <div ref={bottomRef} />
      </div>

      <form
        onSubmit={onSubmit}
        className="sticky bottom-20 mt-3 rounded-2xl border border-border bg-surface p-2 md:bottom-4"
      >
        {image && (
          <div className="relative mb-2 inline-block">
            {/* eslint-disable-next-line @next/next/no-img-element -- local data URL */}
            <img src={image} alt="Podgląd" className="h-24 rounded-lg object-cover" />
            <button
              type="button"
              aria-label="Usuń zdjęcie"
              onClick={() => setImage(null)}
              className="absolute -top-2 -right-2 rounded-full bg-background p-1 text-foreground"
            >
              <CloseIcon width={14} height={14} />
            </button>
          </div>
        )}
        {error && <p className="mb-2 px-1 text-xs text-danger">{error}</p>}
        <div className="flex items-end gap-2">
          <button
            type="button"
            aria-label="Dodaj zdjęcie"
            disabled={busy}
            onClick={() => fileRef.current?.click()}
            className="rounded-full p-2.5 text-muted hover:bg-surface-hover hover:text-accent disabled:opacity-50"
          >
            <ImageIcon />
          </button>
          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => onPickImage(e.target.files?.[0])}
          />
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                e.currentTarget.form?.requestSubmit();
              }
            }}
            rows={1}
            placeholder="Napisz wiadomość…"
            className="max-h-32 min-h-10 flex-1 resize-none rounded-xl bg-background px-3 py-2.5 text-sm placeholder:text-muted focus:outline-none focus:ring-1 focus:ring-accent/40"
          />
          <button
            type="submit"
            aria-label="Wyślij"
            disabled={busy || (!text.trim() && !image)}
            className="rounded-full bg-accent p-2.5 text-background disabled:opacity-40"
          >
            <SendIcon />
          </button>
        </div>
      </form>

      {preview && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 p-4"
          onClick={() => setPreview(null)}
          role="dialog"
          aria-modal="true"
        >
          {/* eslint-disable-next-line @next/next/no-img-element -- local data URL */}
          <img src={preview} alt="Zdjęcie" className="max-h-full max-w-full rounded-lg" />
        </div>
      )}

      <ConfirmDialog
        open={toDelete !== null}
        title="Usunąć wiadomość?"
        description="Tej operacji nie można cofnąć."
        confirmLabel="Usuń"
        onConfirm={() => {
          if (toDelete) chat.remove(toDelete);
          setToDelete(null);
        }}
        onCancel={() => setToDelete(null)}
      />
    </div>
  );
}
