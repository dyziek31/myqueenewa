"use client";

import { useState, type FormEvent } from "react";
import { TrashIcon } from "@/components/layout/icons";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { EmptyState } from "@/components/ui/EmptyState";
import { Field } from "@/components/ui/Field";
import { Input } from "@/components/ui/Input";
import { PageHeader } from "@/components/ui/PageHeader";
import { parseAmount } from "@/lib/amount";
import { cn } from "@/lib/cn";
import { trip } from "@/lib/data";
import { formatCurrency } from "@/lib/format";

export default function TripPage() {
  const items = trip.useItems();
  const [name, setName] = useState("");
  const [amount, setAmount] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [toDelete, setToDelete] = useState<string | null>(null);

  const total = items.reduce((sum, c) => sum + c.amount, 0);
  const paid = items.filter((c) => c.paid).reduce((sum, c) => sum + c.amount, 0);
  const remaining = total - paid;
  const percent = total > 0 ? Math.round((paid / total) * 100) : 0;

  function onSubmit(event: FormEvent) {
    event.preventDefault();
    const value = parseAmount(amount);
    if (!name.trim()) return setError("Wpisz nazwę kosztu.");
    if (!(value > 0)) return setError("Wpisz poprawną kwotę, np. 250.");
    trip.add({ name: name.trim(), amount: value, paid: false });
    setName("");
    setAmount("");
    setError(null);
  }

  return (
    <>
      <PageHeader title="Wyjazd" subtitle="Wpisz koszty i odznaczaj, które są już pokryte." />

      <Card className="mb-6">
        <div className="grid grid-cols-3 gap-3 text-center sm:text-left">
          <div>
            <p className="text-xs text-muted uppercase">Razem</p>
            <p className="mt-1 text-lg font-semibold tabular-nums">{formatCurrency(total)}</p>
          </div>
          <div>
            <p className="text-xs text-muted uppercase">Pokryte</p>
            <p className="mt-1 text-lg font-semibold text-success tabular-nums">{formatCurrency(paid)}</p>
          </div>
          <div>
            <p className="text-xs text-muted uppercase">Zostało</p>
            <p className="mt-1 text-lg font-semibold text-accent tabular-nums">{formatCurrency(remaining)}</p>
          </div>
        </div>
        <div className="mt-4 h-2 overflow-hidden rounded-full bg-background" aria-label={`Pokryte ${percent}%`}>
          <div className="h-full rounded-full bg-success transition-all" style={{ width: `${percent}%` }} />
        </div>
        <p className="mt-2 text-xs text-muted">{percent}% pokryte</p>
      </Card>

      <Card className="mb-6">
        <form onSubmit={onSubmit} className="grid gap-4 sm:grid-cols-[1fr_8rem_auto] sm:items-end">
          <Field label="Koszt" htmlFor="trip-name">
            <Input
              id="trip-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="np. Nocleg, paliwo, bilety…"
            />
          </Field>
          <Field label="Kwota (zł)" htmlFor="trip-amount">
            <Input
              id="trip-amount"
              inputMode="decimal"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="0,00"
            />
          </Field>
          <Button type="submit" variant="primary">
            Dodaj
          </Button>
        </form>
        {error && <p className="mt-3 text-sm text-danger">{error}</p>}
      </Card>

      {items.length === 0 ? (
        <EmptyState title="Brak kosztów" description="Dodaj pierwszy koszt wyjazdu." />
      ) : (
        <Card className="p-0 sm:p-0">
          <ul className="divide-y divide-border">
            {items.map((c) => (
              <li key={c.id} className="flex items-center gap-3 px-4 py-3 sm:px-5">
                <input
                  id={`paid-${c.id}`}
                  type="checkbox"
                  checked={c.paid}
                  onChange={(e) => trip.update(c.id, { paid: e.target.checked })}
                  className="h-5 w-5 shrink-0 accent-[var(--success)]"
                />
                <label
                  htmlFor={`paid-${c.id}`}
                  className={cn("min-w-0 flex-1 truncate text-sm", c.paid && "text-muted line-through")}
                >
                  {c.name}
                </label>
                <span className={cn("text-sm font-medium tabular-nums", c.paid && "text-muted")}>
                  {formatCurrency(c.amount)}
                </span>
                <button
                  type="button"
                  aria-label={`Usuń ${c.name}`}
                  onClick={() => setToDelete(c.id)}
                  className="text-muted hover:text-danger"
                >
                  <TrashIcon width={16} height={16} />
                </button>
              </li>
            ))}
          </ul>
        </Card>
      )}

      <ConfirmDialog
        open={toDelete !== null}
        title="Usunąć koszt?"
        description="Tej operacji nie można cofnąć."
        confirmLabel="Usuń"
        onConfirm={() => {
          if (toDelete) trip.remove(toDelete);
          setToDelete(null);
        }}
        onCancel={() => setToDelete(null)}
      />
    </>
  );
}
