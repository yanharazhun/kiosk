# Demo Kiosk: self-service ordering

A full-stack portfolio project: a self-service ordering kiosk for a burger restaurant ("Ember & Bun"), with a card payment flow and a staff screen that receives orders in real time.

> **Status: work in progress.** The ordering flow, payment and staff screen work end to end. See [Roadmap](#roadmap) for what is next.

**Stack:** Next.js 16 (App Router, Server Components, Server Actions) · React 19 · TypeScript · CSS Modules · Prisma 7 · PostgreSQL 17 (Docker) · Zod · Argon2

## What it does

**Kiosk** (portrait touchscreen, 1080×1920, scaled to any window)
- Eat here / take away, category catalogue, English and Danish.
- Product sheet: make-it-a-meal upgrade, required choices (drink, side), extras with quantities, removals ("no onion").
- Cart with merge of identical lines, edit, quantity, live total in DKK.
- Checkout: pay by card or at the counter. The server re-validates the whole cart and recomputes every price; the client's total is never trusted.
- Card payment through an on-screen **demo terminal** (a dev tool outside the kiosk frame) with approve, decline, timeout and cancel.

**Staff screen** (`/staff`, login required)
- Order board: awaiting payment → new → preparing → ready → handed over, with confirmation on the steps that are costly to get wrong.
- Stop list: mark dishes and ingredients as sold out; kiosks update without reloading.
- Live updates over Server-Sent Events.

## Scope: a kiosk, not a POS

In real projects a kiosk is a **sales channel** on top of the restaurant's existing POS / back office, which owns the menu, the stop list, the kitchen display, fiscal receipts and reports; the kiosk integrates with it through an API.

This project therefore does **not** aim to build a full POS. The staff screen is a deliberately small **stand-in** for that system, just enough to show where an order goes after the kiosk. Menu management (editing products, prices, modifier groups), reporting and fiscalisation are out of scope; the menu comes from the seed.

## Engineering highlights

- **Never trust the client.** `placeOrder` re-reads the menu from the database, validates groups, options, quantities and required choices, recomputes prices and stores a **snapshot** of names and prices on the order, so later menu edits don't rewrite history.
- **Money as integers** (øre), formatted only for display.
- **Order numbers** per business day (04:00 Copenhagen boundary) from an atomic `upsert … increment`, safe with several kiosks ordering at the same moment.
- **Status changes as compare-and-set** (`UPDATE … WHERE status = $from`): two staff screens pressing the same button can't both win.
- **Card payment as a parked request**: the payment route waits on a deferred promise that the terminal settles, with a timeout and client-abort via `AbortSignal.any`. Route Handlers instead of Server Actions here, because actions are dispatched one at a time per client.
- **Real time** with an in-process event bus and SSE; the kiosk refreshes its menu through its own fetch so a failed refresh never loses the customer's cart.
- **Staff auth without a library**: Argon2 password hashes, database sessions (only a SHA-256 of the token is stored), HttpOnly cookie, brute-force lockout with an atomic counter, role checks in the data access layer and in every Server Action.
- **Database as the last line of defence**: UUID v7 keys, indexes on every foreign key, CHECK constraints (non-negative prices, valid quantities, JSON shape of translations), soft delete.

## Getting started

Requirements: Node.js ≥ 22.12 and Docker Desktop.

```bash
cp .env.example .env      # Windows PowerShell: Copy-Item .env.example .env
npm install               # also generates the Prisma client
npm run db:up             # Postgres in Docker
npm run db:setup          # apply migrations and seed the demo menu and users
npm run dev               # http://localhost:3000
```

To start over with a clean database: `npm run db:reset`.

### Demo accounts

| Screen | Login |
|---|---|
| Kiosk `/` | none |
| Staff `/staff` | `kitchen` / `change-me-kitchen` or `admin` / `change-me-admin` |

Passwords come from `.env` (`SEED_*`) at seed time.

### Try it

1. Open the kiosk at `/` and, in a second window, `/staff` (log in as `kitchen`).
2. Order on the kiosk and choose **Pay at the counter**: the order appears under *Awaiting payment* on the staff screen.
3. Order again and pay **by card**: use the *terminal-simulator* panel in the bottom-right corner to approve or decline.
4. Move orders through the board; on the *Stop list* tab mark Fries as sold out and watch them disappear from the kiosk.

## Project structure

```
src/
  app/
    (kiosk)/        kiosk screens: welcome, mode, menu, cart, pay, done
    (staff)/staff/  login and the protected staff board / stop list
    api/            payments, demo terminal, SSE events, menu
  components/       kiosk/, staff/, realtime/
  lib/
    menu/           getMenu: the menu DTO and its filtering rules
    order/          selection, cart, placeOrder, transitions, business day
    staff/          staff data access and server actions
    auth/           sessions, login, role checks
    events/         in-process event bus
    payments/       demo terminal
prisma/             schema, migrations (with hand-written CHECK constraints), seed
```

## Roadmap

- [ ] Pickup board (`/board`): order numbers for customers
- [ ] Tests (unit for pricing and cart rules, end-to-end for the order flow) and CI
- [ ] Product photos
- [ ] VAT (moms) on the receipt
- [ ] Idle timeout on the kiosk ("Still there?")
- [ ] Run everything with one `docker compose up`

## Demo shortcuts

Deliberate simplifications, documented rather than hidden:

- The kiosk has no device login; every order is attributed to the seeded `demo` kiosk account.
- The terminal endpoint is open: it stands in for a payment provider's signed webhook.
- The event bus and pending payments live in memory, which assumes a single server process. Several instances would need Postgres `LISTEN/NOTIFY` or Redis.

## Scripts

| Script | What it does |
|--------|--------------|
| `dev` / `build` / `start` | Next.js dev server / production build / run build |
| `lint` / `typecheck` | ESLint / TypeScript without emitting |
| `test` / `test:watch` | Unit tests (Vitest), once / on file changes |
| `db:up` / `db:down` | Start / stop the Postgres container |
| `db:setup` | Apply migrations and seed (first run) |
| `db:migrate` | Create + apply a migration from schema changes |
| `db:seed` | Seed the demo menu and users |
| `db:reset` | Drop all data, re-apply migrations and re-seed (asks for confirmation) |
| `db:generate` | Regenerate the Prisma client |
| `db:studio` | Browse the database in Prisma Studio |
