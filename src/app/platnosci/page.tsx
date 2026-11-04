"use client";

import { useMemo, useState, type FormEvent } from "react";
import { TrashIcon } from "@/components/layout/icons";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { EmptyState } from "@/components/ui/EmptyState";
import { Field } from "@/components/ui/Field";
import { Input } from "@/components/ui/Input";
import { PageHeader } from "@/components/ui/PageHeader";
import { parseAmount } from "@/lib/amount";
import { payments } from "@/lib/data";
import { currentMonthKey, formatCurrency, formatDate, monthKey, todayIso } from "@/lib/format";

export default function PaymentsPage() {
  const items = payments.useItems();
  const [date, setDate] = useState(todayIso);
  const [name, setName] = useState("");
  const [amount, setAmount] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [toDelete, setToDelete] = useState<string | null>(null);

  const sorted = useMemo(
    () =>
      [...items].sort((a, b) =>
        a.date === b.date ? b.createdAt.localeCompare(a.createdAt) : b.date.localeCompare(a.date),
      ),
    [items],
  );
  const total = items.reduce((sum, p) => sum + p.amount, 0);
  const month = currentMonthKey();
  const monthTotal = items
    .filter((p) => monthKey(p.date) === month)
    .reduce((sum, p) => sum + p.amount, 0);

  function onSubmit(event: FormEvent) {
    event.preventDefault();
    const value = parseAmount(amount);
    if (!name.trim()) return setError("Wpisz nazwę wydatku.");
    if (!date) return setError("Wybierz datę.");
    if (!(value > 0)) return setError("Wpisz poprawną kwotę, np. 49,99.");
    payments.add({ date, name: name.trim(), amount: value });
    setName("");
    setAmount("");
    setError(null);
  }

  return (
    <>
      <PageHeader title="Historia płatności" subtitle="Spisuj datę, nazwę i kwotę każdego wydatku." />

      <div className="mb-6 grid grid-cols-2 gap-3">
        <Card className="p-4 sm:p-5">
          <p className="text-xs text-muted uppercase">W tym miesiącu</p>
          <p className="mt-1 text-xl font-semibold">{formatCurrency(monthTotal)}</p>
        </Card>
        <Card className="p-4 sm:p-5">
          <p className="text-xs text-muted uppercase">Łącznie</p>
          <p className="mt-1 text-xl font-semibold">{formatCurrency(total)}</p>
        </Card>
      </div>

      <Card className="mb-6">
        <form onSubmit={onSubmit} className="grid gap-4 sm:grid-cols-[9rem_1fr_8rem_auto] sm:items-end">
          <Field label="Data" htmlFor="pay-date">
            <Input id="pay-date" type="date" value={date} onChange={(e) => setDate(e.target.value)} />
          </Field>
          <Field label="Nazwa" htmlFor="pay-name">
            <Input
              id="pay-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="np. Zakupy, kino…"
            />
          </Field>
          <Field label="Kwota (zł)" htmlFor="pay-amount">
            <Input
              id="pay-amount"
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

      {sorted.length === 0 ? (
        <EmptyState title="Brak wydatków" description="Dodaj pierwszy wydatek w formularzu powyżej." />
      ) : (
        <Card className="p-0 sm:p-0">
          <ul className="divide-y divide-border">
            {sorted.map((p) => (
              <li key={p.id} className="flex items-center gap-3 px-4 py-3 sm:px-5">
                <span className="w-20 shrink-0 text-xs text-muted tabular-nums">{formatDate(p.date)}</span>
                <span className="min-w-0 flex-1 truncate text-sm">{p.name}</span>
                <span className="text-sm font-medium tabular-nums">{formatCurrency(p.amount)}</span>
                <button
                  type="button"
                  aria-label={`Usuń ${p.name}`}
                  onClick={() => setToDelete(p.id)}
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
        title="Usunąć wydatek?"
        description="Tej operacji nie można cofnąć."
        confirmLabel="Usuń"
        onConfirm={() => {
          if (toDelete) payments.remove(toDelete);
          setToDelete(null);
        }}
        onCancel={() => setToDelete(null)}
      />
    </>
  );
}
