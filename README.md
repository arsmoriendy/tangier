# tangier

A point-of-sale app for retail stores. Built with Next.js 16, React 19,
Drizzle ORM on PostgreSQL, and better-auth; receipts print to USB ESC/POS
thermal printers. Supports Indonesian Rupiah (IDR) and localization.

![Transaction page in dark mode](assets/trx-page-screenshot.png)

_Fast checkout: barcode search, buy and sell prices, per-row quantity, running
total, plus hold/recall and save-&-print in the footer._

![Item page in light mode](assets/item-page-screenshot.png)

_Item management: buy prices with stock, sell prices per price group with
margins, barcodes, and a searchable item list._

## Features

- **Fast checkout** — search by name or barcode (`Ctrl+K` / `F3`), add rows
  with `Ctrl+Enter`, step prices with the arrow keys, and drive the whole flow
  from the keyboard (`F1` hold, `F6` recall, `F7` save & print).
- **Held transactions** — park a sale and recall it later; recalling edits the
  held row in place instead of creating a duplicate.
- **Flexible pricing** — several buy prices per item, each with its own stock;
  a sell price per price group (with colors and priority); manual "qty price"
  overrides; margin and discount indicators for admins.
- **Stock tracking** — stock is decremented on checkout and restored when a
  transaction is edited, loses rows, or is deleted.
- **Catalog admin** — items, units, price groups, barcode groups, and users,
  all behind the admin role.
- **History & reports** — filter by date or ID, review revenue, expenses,
  profit, transaction counts and averages, then edit or delete past sales.
- **Receipts** — header/footer text, printable width, and per-column layout
  for USB ESC/POS printers.
- **Backup & restore** — dump and restore the database from the UI with
  `pg_dump` / `psql` (admin only).
- **Comforts** — English/Indonesian locales, light/dark themes, IDR input and
  formatting, and an optional Rust / Tauri desktop shell.

## Tech stack

| Layer     | Choice                                            |
| --------- | ------------------------------------------------- |
| Framework | Next.js 16 (App Router), React 19, TypeScript     |
| Data      | PostgreSQL, Drizzle ORM + drizzle-kit             |
| Auth      | better-auth (email/password, admin + JWT plugins) |
| UI        | Tailwind CSS v4, Base UI, shadcn, Phosphor icons  |
| Forms     | TanStack React Form + Zod                         |
| State     | valtio proxies behind React context providers     |
| i18n      | next-intl (`en-ID`, `id-ID`)                      |
| Printing  | `@node-escpos/core` + `@node-escpos/usb-adapter`  |
| Testing   | Vitest (pure-logic utilities)                     |

## Requirements

- [Bun](https://bun.sh) — package manager and runtime.
- PostgreSQL, plus the `pg_dump` / `psql` client tools for backup & restore.
- A USB ESC/POS thermal printer (optional). Defaults to an Epson device,
  VID `0x04b8` / PID `0x0202`.

## Getting started

```bash
bun install

# Provide the required environment variables (see below), e.g.:
cat > .env.local <<'EOF'
DATABASE_URL=postgres://postgres:postgres@localhost:5432/tangier
BETTER_AUTH_SECRET=replace-with-at-least-32-random-characters
BETTER_AUTH_URL=http://localhost:3000
EOF

bun -b dev
```

Open <http://localhost:3000>, sign up, and the first account is promoted to an
active admin automatically. Later sign-ups stay inactive until an admin
activates them.

Migrations run on startup: `instrumentation.ts` validates the environment and
calls `migrateDb()`, which applies the SQL files in `drizzle/`.

### Environment variables

Server-only, validated by `@t3-oss/env-nextjs` in `lib/env.ts`.

| Variable              | Required | Default  | Description                             |
| --------------------- | -------- | -------- | --------------------------------------- |
| `DATABASE_URL`        | yes      | —        | PostgreSQL connection string            |
| `BETTER_AUTH_SECRET`  | yes      | —        | Auth signing secret, at least 32 chars  |
| `BETTER_AUTH_URL`     | yes      | —        | Public app URL, used for JWKS/issuer    |
| `PRINTER_VID`         | no       | `0x04b8` | USB vendor ID of the thermal printer    |
| `PRINTER_PID`         | no       | `0x0202` | USB product ID of the thermal printer   |
| `PRINTER_WIDTH`       | no       | `33`     | Printable receipt width, in columns     |
| `SKIP_ENV_VALIDATION` | no       | unset    | Set to `1` to bypass validation (build) |

Production credentials live in `secrets.json`, encrypted with SOPS
(AES256-GCM + PGP). Decrypt it locally with `sops -d secrets.json`; never
commit plaintext secrets.

## Scripts

| Command              | What it does                                    |
| -------------------- | ----------------------------------------------- |
| `bun -b dev`         | Dev server with Turbopack (use the bun runtime) |
| `bun run build`      | Production build + standalone output            |
| `bun run start`      | Serve the production build                      |
| `bun run test`       | Vitest, verbose reporter                        |
| `bun run typecheck`  | Type-check only (`noEmit`)                      |
| `bun run lint`       | ESLint                                          |
| `bun run format`     | Prettier, write mode                            |
| `bun run intl-check` | Find unused i18n keys (source locale `en-ID`)   |

## Database changes

Schemas live in `lib/db/schema.ts` (app) and `lib/db/auth-schema.ts` (auth).
After editing them, generate a migration and commit the SQL:

```bash
bun drizzle-kit generate
```

`drizzle-kit` only diffs the schema snapshot, so no live database is needed.
The generated files in `drizzle/` are applied at the next startup.

## Printing

Receipts print over USB from the server (`lib/print-trx-receipt.ts`) using
`@node-escpos/usb-adapter`, with the width taken from `PRINTER_WIDTH`. Header
and footer text are editable on **Options → Receipt**.

### `usb` compatibility

The native `usb` module needs access to the device node.

1. On Linux, apply a udev rule (adjust the IDs to your printer):

   ```udev
   SUBSYSTEM=="usb", ATTRS{idVendor}=="04b8", ATTRS{idProduct}=="0202", MODE="0666"
   ```

2. On **Arch** with Bun installed via `curl -fsSL https://bun.sh/install | bash`,
   run the app with the bun runtime, e.g. `bun -b dev`.

3. On **NixOS**, enter the dev shell (`nix develop`) and build the binding:

   ```bash
   cd node_modules/usb && node-gyp build
   ```

## Docker

The `Dockerfile` builds a standalone Next.js bundle on `oven/bun:alpine` and
runs `./server.js`. The image includes `libudev-zero` for USB printing and
`postgresql18-client` for backup & restore.

```bash
docker build -t tangier .
docker run --rm -p 3000:3000 --env-file .env.production tangier
```

The `justfile` wraps the same flow (`just build-and-save-latest`), tagging the
image with the `package.json` version and saving it as an `.img.tar.xz`.

## Project structure

```text
app/            routes: auth, (authorized)/transactions, (admin)/*, options, api
components/     UI primitives, form fields, indicators, sidebar
contexts/       valtio-backed providers (items, trx, filters, settings, …)
lib/            server actions (crud/), db schema & migrations, printing
messages/       en-ID.json, id-ID.json
drizzle/        generated SQL migrations
```

Data access is entirely server actions (`lib/crud/*.ts`); the only HTTP API
routes are better-auth and backup/restore.

## Notes

- Commit messages follow Conventional Commits and are max 50 characters.
- See [AGENTS.md](./AGENTS.md) for architecture, conventions, and gotchas.
