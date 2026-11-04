"use client";

import { useState, type FormEvent } from "react";
import { TrashIcon } from "@/components/layout/icons";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { EmptyState } from "@/components/ui/EmptyState";
import { PageHeader } from "@/components/ui/PageHeader";
import { Textarea } from "@/components/ui/Textarea";
import { cn } from "@/lib/cn";
import { ideas } from "@/lib/data";

function formatDay(iso: string): string {
  return new Intl.DateTimeFormat("pl-PL", { day: "2-digit", month: "short", year: "numeric" }).format(
    new Date(iso),
  );
}

export default function ServicePage() {
  const items = ideas.useItems();
  const [text, setText] = useState("");
  const [toDelete, setToDelete] = useState<string | null>(null);

  const ordered = [...items].reverse();
  const open = ordered.filter((i) => !i.done);
  const done = ordered.filter((i) => i.done);

  function onSubmit(event: FormEvent) {
    event.preventDefault();
    if (!text.trim()) return;
    ideas.add({ text: text.trim(), done: false });
    setText("");
  }

  function renderList(list: typeof items) {
    return (
      <ul className="flex flex-col gap-3">
        {list.map((idea) => (
          <li key={idea.id}>
            <Card className="flex items-start gap-3 p-4 sm:p-4">
              <input
                type="checkbox"
                aria-label="Zrealizowane"
                checked={idea.done}
                onChange={(e) => ideas.update(idea.id, { done: e.target.checked })}
                className="mt-0.5 h-5 w-5 shrink-0 accent-[var(--accent)]"
              />
              <div className="min-w-0 flex-1">
                <p className={cn("text-sm break-words whitespace-pre-wrap", idea.done && "text-muted line-through")}>
                  {idea.text}
                </p>
                <p className="mt-1 text-[11px] text-muted">{formatDay(idea.createdAt)}</p>
              </div>
              <button
                type="button"
                aria-label="Usuń pomysł"
                onClick={() => setToDelete(idea.id)}
                className="text-muted hover:text-danger"
              >
                <TrashIcon width={16} height={16} />
              </button>
            </Card>
          </li>
        ))}
      </ul>
    );
  }

  return (
    <>
      <PageHeader title="Moja służba" subtitle="Wypisuj pomysły — odhacz, gdy zrealizujesz 👑" />

      <Card className="mb-6">
        <form onSubmit={onSubmit} className="flex flex-col gap-3">
          <Textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            rows={3}
            placeholder="Nowy pomysł…"
            aria-label="Nowy pomysł"
          />
          <div className="flex justify-end">
            <Button type="submit" variant="primary" disabled={!text.trim()}>
              Dodaj pomysł
            </Button>
          </div>
        </form>
      </Card>

      {items.length === 0 ? (
        <EmptyState title="Brak pomysłów" description="Zapisz pierwszy pomysł powyżej." />
      ) : (
        <div className="flex flex-col gap-6">
          {open.length > 0 && renderList(open)}
          {done.length > 0 && (
            <div>
              <p className="mb-3 text-xs font-medium tracking-wide text-muted uppercase">
                Zrealizowane ({done.length})
              </p>
              {renderList(done)}
            </div>
          )}
        </div>
      )}

      <ConfirmDialog
        open={toDelete !== null}
        title="Usunąć pomysł?"
        description="Tej operacji nie można cofnąć."
        confirmLabel="Usuń"
        onConfirm={() => {
          if (toDelete) ideas.remove(toDelete);
          setToDelete(null);
        }}
        onCancel={() => setToDelete(null)}
      />
    </>
  );
}
