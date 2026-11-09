# myGoddessModlishka 👑

Prosta aplikacja webowa z czterema zakładkami:

- **Chat** — rozmowa z wysyłaniem zdjęć. Przełącznik „Piszesz jako: Ja / Modlishka”
  określa autora wiadomości. Zdjęcia są automatycznie zmniejszane (max 1024 px),
  kliknięcie powiększa zdjęcie.
- **Płatności** — historia wydatków: data, nazwa, kwota. Suma w bieżącym
  miesiącu i łącznie.
- **Wyjazd** — lista kosztów z checkboxem „pokryte”. Podsumowanie: razem /
  pokryte / zostało i pasek postępu.
- **Moja służba** — lista pomysłów, które można odhaczać jako zrealizowane.

Wszystkie dane są zapisywane w przeglądarce (`localStorage`) — bez logowania,
bazy danych i backendu. Każde urządzenie/przeglądarka ma więc osobne dane.

## Uruchomienie

Wymagany Node.js 20+.

```bash
npm install
npm run dev
```

Aplikacja: http://localhost:3000

```bash
npm run build   # build produkcyjny
npm run start   # uruchomienie builda
npm run lint    # ESLint
```

## Technologia

Next.js (App Router) + TypeScript + Tailwind CSS v4.

## Struktura

```
src/
  app/
    page.tsx          # Chat ("/")
    platnosci/        # Historia płatności
    wyjazd/           # Koszty wyjazdu
    sluzba/           # Moja służba — pomysły
  components/
    layout/           # AppShell (sidebar + dolne menu na telefonie), ikony
    ui/               # Button, Card, Input, …
  lib/
    collection.ts     # CRUD listy w localStorage
    data.ts           # kolekcje: chat, payments, trip, ideas
    image.ts          # kompresja zdjęć
  types/              # typy danych
```

## Wdrożenie na Vercel

Wypchnij repozytorium na GitHub, w Vercel kliknij **Add New Project →
Import Git Repository**, wybierz repo i **Deploy** — Next.js wykryje się sam.
