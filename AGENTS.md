# AGENTS.md

Point-of-sale (POS) application for a retail business, built with Next.js 16 (App Router), React 19, Drizzle ORM (PostgreSQL), and `better-auth`. Targets a USB ESC/POS thermal receipt printer (default Epson VID `0x04b8` / PID `0x0202`). Currency is hardcoded to IDR (`id-ID`) throughout. UI is bilingual (`en-ID`, `id-ID`) via `next-intl`, locale stored in a `locale` cookie.

## Commands

Package manager is **bun** (lockfile is `bun.lock`). On Arch/NixOS the `usb` native dependency needs the dev shell from `flake.nix` (`nix develop`) plus `node-gyp build` inside `node_modules/usb`; on other systems apply the udev rule from `README.md`.

```bash
bun install                 # install deps
bun -b dev                  # dev server (turbopack) — use bun runtime, see README
bun run build               # build; sets SKIP_ENV_VALIDATION=1 and assembles standalone output
bun run start               # start built server
bun run test                # vitest, verbose reporter
bun run typecheck           # tsc --noEmit
bun run lint                # eslint
bun run format              # prettier --write on ts/tsx/css
bun run intl-check          # find unused i18n keys (source locale en-ID)
```

`build` copies `public/` and `.next/static` into `.next/standalone/` — the Docker image (`oven/bun:alpine`) runs `./server.js` from the standalone output. Do not change this assembly step unless you also update the Dockerfile.

Drizzle migrations are managed with `drizzle-kit` (config in `drizzle.config.ts`, dialect `postgresql`, output dir `./lib/db`). Schemas live in `lib/db/schema.ts` (app tables) and `lib/db/auth-schema.ts` (better-auth tables). Env validation is via `@t3-oss/env-nextjs` (`lib/env.ts`) — `SKIP_ENV_VALIDATION=1` bypasses it (used by `build`).

## Secrets

`secrets.json` is **SOPS-encrypted** (AES256_GCM, PGP key `4608BD8B17ABEE9F0DB5DE4AC2333D93F6D7C06F`). It contains `DATABASE_URL`, `BETTER_AUTH_SECRET`, `BETTER_AUTH_URL`. Decrypt with SOPS before running locally; never commit plaintext. Required server env vars: `DATABASE_URL`, `BETTER_AUTH_SECRET` (min 32 chars), `BETTER_AUTH_URL` (validated as URL). Printer vars (`PRINTER_VID`, `PRINTER_PID`, `PRINTER_WIDTH`) default to the Epson values above and are optional.

## Architecture & control flow

### Route groups (App Router)

- `app/auth/` — unauthenticated sign-in/sign-up; also `auth/inactive/` for users with `active=false` (the `authGuard` redirects inactive users here).
- `app/(authorized)/` — everything behind `authGuard` (requires session + `user.active`). Wrapped by `SessionProvider` + `SidebarProvider` + `AppSidebar` in its layout.
- `app/(authorized)/(admin)/` — admin-only subtree; its layout re-checks `session.user.role === "admin"` and redirects to `/auth` otherwise. Contains `items`, `units`, `price-groups`, `barcode-groups`, `users`, `receipt`. The sidebar only renders these links for admins.
- `app/(authorized)/transactions/` — the core POS UI (`new/` for the live transaction form, `history/` for past transactions + reports). Available to all authorized users.
- `app/page.tsx` redirects to `/transactions/new`.
- `app/api/auth/[...all]/route.ts` — better-auth HTTP handler (`toNextJsHandler`).

### Server / client boundary

- **Server actions** are the data layer. Every file in `lib/crud/*.ts` starts with `"use server"` and exports async CRUD functions that call `db` directly — there is no separate API client. Components call these server actions directly (e.g. `createTransaction`, `listItems`).
- `lib/get-session.ts` and `lib/auth-guard.ts` are also `"use server"`; `authGuard()` is called in the `(authorized)` layout to gate the whole subtree. The `(admin)` layout calls `getSession()` again to check role.
- `lib/auth.ts` configures `better-auth` with the drizzle adapter, the `admin()` plugin, email/password (min password length **3**), and a `databaseHooks.user.create.before` hook that **auto-promotes the first user to admin and marks them active** — this is how the system bootstraps its first admin. The `beforeDelete` hook prevents deleting the sole admin.
- Client auth uses `lib/auth-client.ts` (`createAuthClient` with `inferAdditionalFields` + `adminClient`).

### Context providers

State is split between React Context and **valtio** proxies. There are two provider trees:

1. **Root layout** (`app/layout.tsx`) wraps everything in: `ThemeProvider` (next-themes, class attribute) → `LocalStorageProvider` → `NextIntlClientProvider` → `I18nProvider` (react-aria i18n) → `ZodConfig` (binds zod locale to next-intl locale) → children + `<Toaster/>`.
2. **Per-page providers** (server components, e.g. `transactions/new/page.tsx`) fetch initial data via server actions, then wrap client children in `PriceGroupsProvider`, `UnitsProvider`, `ItemsProvider`, `HeldProvider`, `TrxProvider`, `FiltersProvider`, etc. Each page composes only the providers it needs.

The shared pattern is `ValtioContext<T> = { proxy: T; snap: Snapshot<T> }` (see `contexts/valtio-context.d.ts`). Context hooks return `{ setX: proxy, getX: snap }`-style accessors — mutate the proxy to update, read the snapshot for render. `LocalStorageProvider` persists a valtio proxy to `localStorage["tangierStore"]` via `subscribe`; its schema (`decrementStock`, `showHisotryItems` [sic — typo is in the code], `showTrxSummary`) is the source of truth for those UI preferences.

`SessionProvider` is React-only (no valtio) and just holds the server-resolved session for `useSession()`.

### Forms

All forms use **TanStack React Form** via the shared hook in `components/form.tsx`:

```ts
export const { useAppForm, withForm } = createFormHook({
  fieldComponents: { TextField, NumberField, IdrField, TextareaField },
  formComponents: { SubmitButton },
  ...
})
```

To add a new field type, register it in `components/form.tsx`'s `fieldComponents` (or `formComponents` for form-level components) — otherwise `form.AppField` won't have it. Field components consume `useFieldContext()` / `useFormContext()` from the same hook. `components/text-field.tsx`, `idr-field.tsx`, etc. are the canonical examples. The `<Form>` wrapper takes a `handleSubmit` prop (not `onSubmit`).

Zod schemas typically live next to the form (e.g. `transaction-schema.ts`, `add-item-schema.ts`) and are passed as `validators: { onMount, onChange }`. `lib/zod-config.tsx` is a client component that re-runs `z.config()` whenever the next-intl locale changes, so zod error messages localize.

### Receipt printing

`lib/print-transaction.ts` is a `"use server"` module that opens the USB device via `@node-escpos/usb-adapter` using `env.PRINTER_VID/PID` and prints with `@node-escpos/core`. Receipt width comes from `env.PRINTER_WIDTH` (default 33 columns). Header/footer text comes from the singleton `settings` row (id=1) in the DB. Column layout uses `lib/format-cols.ts` (tested by `format-cols.test.ts`). Printing is best-effort — the transaction form wraps `printTransaction` in try/catch and shows a sonner toast on failure.

### Stock handling

`buy_prices.stock` is decremented per-transaction. `transactionItems` carry a `buyPriceId` and an `updateStock` flag; the transaction form aggregates quantities per `buyPriceId` (accounting for the previous quantity on edits/recalls) and calls `updateBuyPriceStock({ id, stockDelta })`, which uses a SQL `stock + ${stockDelta}` update. Held transactions do not touch stock.

## DB schema notes

- App IDs are **UUIDv7** (`uuid().$defaultFn(() => v7())`); better-auth IDs are `text` (generated by better-auth).
- Composite primary keys: `barcodes` (item + barcodeGroup), `sell_prices` (item + price + priceGroup).
- `transaction_items` stores **snapshots** of `name`, `unit`, `sellPrice`, `buyPrice` (varchar/numeric, not FKs) so historical receipts stay intact when items/units change. `buyPriceId` is an FK to `buy_prices` with `ON DELETE SET NULL` — used only for stock updates.
- `price_groups` has a `hex_color` (6-char varchar, no `#`), `priority` (default 0), and a unique `name_index`. The transaction form renders price groups as colored `RadioGroupChoiceCard`s.
- `settings` is a singleton row with `id=1`; `listSettings()` returns nulls if the row is missing, `updateSettings()` upserts.
- All foreign keys use `ON UPDATE cascade ON DELETE cascade` except `transaction_items.buyPriceId` (set null) and `session/account.userId` (cascade).

## Conventions

- **Path alias**: `@/*` → repo root (configured in `tsconfig.json` and `components.json`). Use `@/lib/...`, `@/components/...`, `@/contexts/...`, `@/app/...`.
- **shadcn** config (`components.json`): style `radix-lyra`, icon library **phosphor** (`@phosphor-icons/react`, with `/ssr` subpath for server components — see `app-sidebar/index.tsx`). UI primitives live in `components/ui/`. Tailwind v4, CSS variables for theme, base color `neutral`. `cn` and `cva` are registered with `prettier-plugin-tailwindcss`.
- **Formatting**: prettier (no semicolons, double quotes, 2-space indent, trailing comma `es5`, print width 80, LF). Biome is also configured (`biome.json`) with matching style and recommended lint rules; eslint uses `eslint-config-next` (core-web-vitals + TS). Run `bun run format` after structural changes.
- **"use server"** directive is at the top of every `lib/crud/*.ts`, `lib/auth-guard.ts`, `lib/get-session.ts`, `lib/set-locale.ts`, `lib/print-transaction.ts`. Keep new server-action files consistent.
- **Translations**: message JSON files in `messages/{en-ID,id-ID}.json`. Server components use `getTranslations(...)` from `next-intl/server`; client components use `useTranslations(...)` / `useLocale()`. Run `bun run intl-check` to catch unused keys. When adding a key, add it to **both** locale files.
- **Currency/number formatting**: `lib/i18n/currency.ts` exports `formatCurrency` (IDR, 2 decimals); `lib/print-transaction.ts` uses a separate `Intl.NumberFormat("id-ID", {})` (no decimals) for receipts — match the context when formatting numbers.
- **Type helpers**: `lib/partial-keys.d.ts` (`PartialKey<T,K>`), `lib/deep-read-only.d.ts` (`DeepReadonly`), `lib/mutable.d.ts` (`Mutable`, `DeepMutable`), `contexts/state-context.d.ts` (`StateContext<T>`). Use these instead of redefining.
- **Tests**: vitest, colocated `*.test.ts` next to the module (see `lib/format-cols.test.ts`). Only pure-logic utilities are currently tested.

## Gotchas

- **First-user bootstrap**: the very first user created through `/auth` is automatically made admin + active; subsequent users default to `role="user"`, `active=false` and cannot log in until an admin activates them (they hit `/auth/inactive`). Keep this hook in `lib/auth.ts` intact.
- **`active` is a custom better-auth field** (`additionalFields`, `input: false`) — it is **not** settable through the standard better-auth client signup flow; only the `user.create.before` hook or an admin action flips it.
- **Admin route guard is duplicated**: the `(admin)` layout re-implements its own session check instead of reusing `authGuard()` (it does not redirect inactive users to `/auth/inactive`, only non-admins to `/auth`). Be careful when editing either.
- **`transactions.id` is UUIDv7**; the receipt printer slices `trx.id.slice(24)` to show only the trailing 12 hex chars as the "Last ID" on receipts. Don't change the slice without checking the printer layout.
- **Held/recall flow**: `listTransactions({ held: true, from: new Date(0), ... })` is used to fetch held transactions (note the epoch `from` — the default 3-hour window would miss them). Recalling updates an existing held transaction in place rather than creating a new one.
- **`formatCols` prioritizes one column** (usually the rightmost/price column) and truncates the others to fit the printer width; the overflow tests in `format-cols.test.ts` encode the exact behavior. If you change the width default, re-run those tests.
- **`showHisotryItems`** is misspelled in the `LocalStorageProvider` schema — preserve the typo or coordinate a migration of the persisted `localStorage["tangierStore"]` values.
- **`next.config.mjs`**: `serverExternalPackages: ["usb"]` is required for the native USB binding; `transpilePackages` includes `@t3-oss/env-nextjs`. `output: "standalone"` is required by the Dockerfile.
- **`instrumentation.ts`** imports `@/lib/env` in `register()` to force env validation at server startup. Don't remove this or env vars won't be validated in production.
- **`drizzle.config.ts`** lists both schema files explicitly; `lib/db/index.ts` merges `schema + relations + authSchema` into one `drizzle()` call so `db.query.*` can use relational queries across both schemas.
- **i18n-check source locale is `en-ID`** — add new keys to `en-ID.json` first or the check will complain.
