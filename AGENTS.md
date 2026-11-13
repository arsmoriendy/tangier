# AGENTS.md

POS app for retail: Next.js 16 (App Router), React 19, Drizzle ORM (PostgreSQL), `better-auth`. Prints to a USB ESC/POS thermal printer (default Epson VID `0x04b8` / PID `0x0202`). Currency is IDR (`id-ID`) only. UI is bilingual (`en-ID`, `id-ID`) via `next-intl`; locale is a `locale` cookie.

## Maintaining this file

Strongly recommended: when you learn something durable and non-obvious (convention, gotcha, command, correction), add a concise entry under the matching section and prune stale ones. Skip task-specific trivia.

## Asking the user for decisions

When choosing between known alternatives, present **structured options** (concrete labels, one-line descriptions, recommended first) instead of an open-ended question. Keep open-ended prompts for clarifying _what_ to build.

## Commits

Never run `git commit` or any other write git command (`git add`, `git commit`, `git stash`, `git reset`, …) — commits are the user's call. Read-only git (`status`, `diff`, `log`) is fine.

Suggest **atomic conventional commit messages**, whole subject line max 50 chars (e.g. `fix(receipt): clamp columns to width`). Use `doc` (not `docs`) as the type — the shorter type frees up characters.

**At most one suggestion per response** — the only exception is Plan mode, where the planned commits are listed as part of the plan:

- **Plan mode**: lay out the whole change set; if it isn't atomic, list one message per planned commit and say which change comes first.
- **Build mode**: implement exactly one atomic change, suggest its single message, and stop. Wait for the user to commit or reject it, then continue with the next change only when they say so.
- **No hidden queue**: never imply a change is still coming. Once the last queued change is done, state it plainly — e.g. `All changes for "<initial prompt>" done.` — filling in the user's original request, and don't say you'll "pick up the next change" unless one is actually queued.
- Never bundle several messages into one Build-mode reply, even when the remaining changes are already obvious — the next message is suggested after the next change.

## Commands

**bun** is the package manager (`bun.lock` authoritative; ignore the stale `package-lock.json`/`pnpm-lock.yaml`). On Arch/NixOS the `usb` native dep needs `nix develop` plus `node-gyp build` in `node_modules/usb`; otherwise apply the `README.md` udev rule.

```bash
bun install                 # install deps — main checkout only, never in a worktree
bun -b dev                  # dev server (turbopack) — use bun runtime, see README
bun run build               # build; sets SKIP_ENV_VALIDATION=1 and assembles standalone output
bun run start               # start built server
bun run test                # vitest, verbose reporter
bun run typecheck           # tsc (type-check only; tsconfig has noEmit)
bun run lint                # eslint
bun run format              # prettier --write on ts/tsx/css
bun run intl-check          # find unused i18n keys (source locale en-ID)
```

- **Do not run `bun run lint`, `bun run dev`, `bun run start`, or `bun run build`** unless asked — the user handles linting and running the app.
- **Do not run `bun install` outside the main checkout.** Deps live there once; a worktree install duplicates `node_modules` (incl. the native `usb` build) and risks churning `bun.lock`. If deps look missing in a worktree, ask the user.

`build` copies `public/`, `.next/static`, and `drizzle/` into `.next/standalone/`; Docker (`oven/bun:alpine`) runs `./server.js` from it and installs `libudev-zero` (USB) + `postgresql18-client` (`pg_dump`/`psql`). Keep the assembly in sync with the Dockerfile.

Drizzle: `drizzle-kit` (`drizzle.config.ts`, postgresql, output `./drizzle`, no `out` override); schemas `lib/db/schema.ts` (app) + `lib/db/auth-schema.ts` (auth); `lib/db/migrate-db.ts` runs from `instrumentation.ts`. Env validation: `@t3-oss/env-nextjs` (`lib/env.ts`); `SKIP_ENV_VALIDATION=1` bypasses it (used by `build`).

## Secrets

**Never touch the database and never read secrets.** No agent-side DB work: don't connect to Postgres, don't run `psql`/`drizzle-kit push`/`migrate`/`studio` against a live DB, and don't decrypt or read `secrets.json` (don't ask for `DATABASE_URL` or credentials — access is denied by design). Schema changes ship as generated migration files (`drizzle-kit generate` is an offline snapshot diff, so it's fine); the user applies them.

`secrets.json` is **SOPS-encrypted** (AES256_GCM, PGP `4608BD8B17ABEE9F0DB5DE4AC2333D93F6D7C06F`) with `DATABASE_URL`, `BETTER_AUTH_SECRET`, `BETTER_AUTH_URL`. Decrypt locally; never commit plaintext. Required server env: `DATABASE_URL`, `BETTER_AUTH_SECRET` (≥32 chars), `BETTER_AUTH_URL` (URL). `PRINTER_VID`/`PRINTER_PID`/`PRINTER_WIDTH` default to the values above and are optional. Backup/restore hand `DATABASE_URL` to `pg_dump`/`psql` as `PG*` env vars (`lib/db/pg-env.ts`, tested) so it never lands in argv; URLs that can't be split (keyword/value conninfo, multiple hosts, unknown parameters) fall back to `--dbname` with a warning.

## Architecture & control flow

### Route groups (App Router)

- `app/auth/` — unauthenticated sign-in/up; `auth/inactive/` for `active=false` (where `getSessionOrRedirect` sends them).
- `app/(authorized)/` — `getSessionOrRedirect()` (session + `user.active`); layout adds `SessionProvider`/`UserSettingsProvider`/`SidebarProvider`/`AppSidebar` and seeds settings via `getUserSettings({ userId })`.
- `app/(authorized)/(admin)/` — `getSessionOrRedirect({ admin: true })` (inactive → `/auth/inactive`, otherwise `/auth`); holds `items`, `units`, `price-groups`, `barcode-groups`, `users`, `backup-restore`; sidebar links are admin-only.
- `app/(authorized)/transactions/` — POS UI (`new/` form, `history/` past + reports), all authorized users.
- `app/(authorized)/options/` — settings + receipt header/footer; all users, some user-settings controls admin-gated (receipt fields are not).
- `app/page.tsx` → `/transactions/new`.
- `app/api/auth/[...all]/route.ts` — better-auth handler (`toNextJsHandler`).
- `app/api/backup/route.ts` + `app/api/restore/route.ts` — admin-only (`isUnauthorized({ admin: true })`) `pg_dump`/`psql`; restore runs `migrateDb()`.
- **Tauri**: components branch on `isTauri()`; backup uses Tauri save/download plugins + `authClient.token()` bearer; exit menu is Tauri-only.

### Server / client boundary

- **Server actions** are the data layer: every `lib/crud/*.ts` is `"use server"` and calls `db` directly; components call it directly (`createTransaction`, `listItems`). No app-data API client (auth = better-auth client; backup/restore = routes).
- **Actions are not individually authorized** — no `getSessionOrRedirect`/`isUnauthorized` inside; layout guards only protect navigation (README backlog: "Server function authorization"). Add checks before trusting one.
- `lib/get-session.ts` + `lib/auth-guard.ts` are `"use server"` too: `getSessionOrRedirect()` guards `(authorized)`, `{ admin: true }` guards `(admin)`; `isUnauthorized(...)` returns 401 JSON.
- `lib/get-session.ts` verifies a Bearer JWT (`jose`/JWKS at `${BETTER_AUTH_URL}/api/auth/jwks`, issuer/audience `BETTER_AUTH_URL`) then falls back to `auth.api.getSession({ headers })`. The JWT is **not** trusted for authorization: `role`/`active` are re-read from `user`, so a token can't outlive a demotion or deactivation.
- `lib/auth.ts`: drizzle adapter, `admin()` + `jwt()` plugins, email/password (min length **3**), `user.changeEmail`/`deleteUser`. `databaseHooks.user.create.before` **auto-promotes the first user to admin + active** (bootstrap); `beforeDelete` blocks deleting the sole admin.
- Client auth: `lib/auth-client.ts` (`inferAdditionalFields`, `adminClient`, `jwtClient`); admin user management and Tauri tokens use `authClient.admin.*`/`authClient.token()`.

### Context providers

Two trees, React Context + **valtio** proxies.

1. Root (`app/layout.tsx`): `ThemeProvider` → `LocalStorageProvider` → `NextIntlClientProvider` → `I18nProvider` → `TooltipProvider` → `ZodConfig` → children + `<Toaster/>`.
2. Per page (server components, e.g. `transactions/new/page.tsx`) fetch data, then compose the providers needed (`PriceGroupsProvider`, `UnitsProvider`, `ItemsProvider`, `HeldProvider`, `TrxProvider`, `FiltersProvider`, …).

- `ValtioContext<T> = { proxy: T; snap: Snapshot<T> }` (`contexts/valtio-context.d.ts`): Items, Held, Trx, Filters, UserSettings, LocalStorage; hooks expose `{ setX: proxy, getX: snap }`. PriceGroups/Units/BarcodeGroups use `StateContext<T>` (`{ state, setState }`); Session is plain React context.
- `LocalStorageProvider` persists to `localStorage["tangierStore"]`; its zod schema is empty (`z.object({})`), so it stores `{}` — preferences live in `user_settings`.
- `UserSettingsProvider` (`contexts/user-settings.tsx`) is valtio-backed, seeded from the `user_settings` row in `(authorized)`; `useUserSettings()` → `{ getUserSettings: snap, setUserSettings: proxy }`. Mutate imperatively; the subscription persists changed keys via `upsertUserSettings` and toasts.
- `SessionProvider` holds the server session for `useSession()`.

### Forms

TanStack React Form via `components/form.tsx` (backup/restore use native HTML forms):

```ts
export const { useAppForm, withForm } = createFormHook({
  fieldComponents: { TextField, NumberField, IdrField, TextareaField },
  formComponents: { SubmitButton },
  ...
})
```

- Add field types to `fieldComponents` (or `formComponents`) or `form.AppField` lacks them; fields use `useFieldContext()`/`useFormContext()` (see `components/text-field.tsx`, `idr-field.tsx`). `<Form>` takes `handleSubmit`, not `onSubmit`.
- Zod schemas sit next to forms (`transaction-schema.ts`, `add-item-schema.ts`) as `validators: { onMount, onChange }`; `lib/zod-config.tsx` re-runs `z.config()` on locale change to localize errors.
- `withForm` does **not** provide the form via context (only `AppForm`/`AppField` give context to their children; the returned component creates no form/provider). Split form UI by making the child its own `withForm` (same `defaultValues`) and passing the parent `form` as a prop — see `transaction-item-table/` (`index.tsx` → `item-row.tsx`, `item-row-dnd.ts`, `form-helpers.ts`: `setIdempotentFieldValue`/`recalculateTotalPrice`). This also avoids nested components inside `render` (remount each render, lost focus). Keep helpers structurally typed.

### Add-item entry (transaction form)

- `add-item-form.tsx` is one row: `SearchItemForm` + add-item `<Form>` as siblings (never nested `<form>`s).
- It lives in `TransactionFooter`'s **first bar** — `<FooterBar><AddItemProvider><AddItemForm form={form}/></AddItemProvider></FooterBar>` — not above the table.
- **Buy price** is a `WrappedCombobox` over `addItem.buyPrices` (`formatCurrency(price)` + `common.stockLeft` in `renderOption`) rendering `UserIdrInput`; admin-only (`showTrxBuyPrice`).
  - Typing edits `buyPrice` but deliberately skips `setInputValue`, so every recorded price stays listed.
  - Picking sets `addItemProxy.buyPrice` + form `buyPrice`; re-pressing the selected one clears `addItemProxy.buyPrice` (`linkedBuyPrice` → null, no stock decrement) while keeping the typed price.
- `common.buyPrice` badge shows `LinkIcon` when `addItemSnap.buyPrice` is set; a differing typed price is flagged by `components/buy-price-mismatch-indicator.tsx`.
- IDR input keeps `arrowControls` and strips `ArrowUp`/`ArrowDown` from `domProps.onKeyDown` so arrows step the price (default `step` 500) rather than moving the list highlight. Required because navigation is floating-ui's `useListNavigation` and `mergeProps` halts only on `preventBaseUIHandler()`, not `defaultPrevented` — `preventDefault()` in `NumberInput` can't stop it.

The footer is the module-level `TransactionFooter` `withForm` (`transaction-footer.tsx`, with `FooterBar`/`RecallBadge`/`MarginBadge`); props: `form`, `selected`/`setSelected`, `recalledTrx`/`setRecalledTrx`, `openRecallDialog`/`setOpenRecallDialog`, `onHold`/`onCancelRecall`, `hideHoldRecall`. Module scope is deliberate: a `Footer`/`Bar` redefined inside `TransactionForm` is a new component type per render, so React remounts it and drops `AddItemForm`'s TanStack state in `useState` (toggling "Show summary" or selecting a row would wipe in-progress input). Do **not** reintroduce footer helpers inside `TransactionForm`'s render body. `RecallBadge` also shows the recalled `createdAt` (localized date + time via `useFormatter`), passed from `recalledTrx`.

### Wrapped combobox (`components/wrapped-combobox.tsx`)

Base UI single-select `Combobox` over unconstrained option type `O`.

- `option` (`null` = none, `undefined` = uncontrolled) and `input` are independent except: picking writes the label in, typing filters options.
- Picking the already-selected option toggles it off (Base UI reports every item press).
- `onInputValueChange` accepts only `input-change`/`input-paste` and ignores `onValueChange(null)` (emitted on emptying or Escape).
- The option→input sync effect keys on `getOptionValue(option)` (from `optionToValue`) with a deliberate `exhaustive-deps` disable — projector props are inline arrows, so depending on them would wipe typed text.
- `renderInput` replaces the input + `InputGroup` chrome with any control (`Input`, `UserIdrInput`, `NumberInput`, …). It gets `value`/`setInputValue` (event-free, `inputValue` is controlled), `invalid`/`disabled`/`placeholder`, `domProps` (Base UI props minus `value`/`onChange`; function renders get no merging).
  - Spread `domProps` onto the real `<input>` or the anchor/keyboard nav breaks; never add a native `onChange` (double-fires with `setInputValue`).
  - This path bypasses Base UI's change handler, so `open` is controlled here and `setInputValue` opens on non-empty input.
  - `openOnFocus` (default `true`) opens on focus (Base UI only opens on mousedown, `openOnInputClick`); safe because `ComboboxItem` calls `preventDefault()` on pointerdown/mousedown, so selection never blurs the input.
- `contentProps` → `ComboboxContent`: `className`, `side`, `align`, `sideOffset`, `alignOffset`, `anchor`. Width defaults to the anchor (`w-(--anchor-width)`, `min-w` anchor+28px): widen with `w-*`, narrow with `w-*` + `min-w-*`; collision flipping is floating-ui's.
- **`aria-invalid` trap**: the `renderInput` path doesn't apply `invalid` automatically. Pass `invalid` in and forward it (`aria-invalid={invalid || undefined}` after the `domProps` spread); never map it to `disabled` (an empty required field is invalid from mount). With `form.Subscribe` (no `field`), read `state.fieldMeta.<name>.isValid` and compare `=== false` — it's `undefined` until `onMount` validation populates `fieldMeta`.

### Receipt printing

`lib/print-trx-receipt.ts` (`"use server"`) opens USB via `@node-escpos/usb-adapter` (`env.PRINTER_VID/PID`) and prints with `@node-escpos/core`; width from `env.PRINTER_WIDTH` (default 33 columns); header/footer from `settings` id=1, edited on `/options` (not admin-gated); columns via `lib/format-cols.ts` (tested). Printing is best-effort: the form catches errors and toasts.

### Stock handling

`buy_prices.stock` decrements per transaction: form items carry `linkedBuyPrice` + `updateStock` (persisted rows have `buyPriceId`). `createTransaction`/`updateTransaction` reconcile stock **inside the same `db.transaction` as the write**, via `buyPriceStockDeltas(prevItems, nextItems)` (`lib/buy-price-stock.ts`, tested) netted per `buyPriceId` as `stock + delta`. Prev items are read from the persisted row inside that transaction (`FOR UPDATE` on the header, so concurrent edits of one transaction serialize), so removed rows, cleared `updateStock`, and re-linked buy prices all restore correctly. Held transactions never move stock: `updateTransaction` restores nothing when the stored row was `held`, and skips stock when the write keeps `held: true`. `deleteTransaction` restores the stock of a non-held row before removing it.

## DB schema notes

- App IDs are **UUIDv7** (`uuid().$defaultFn(() => v7())`); better-auth IDs are `text`.
- Composite PKs: `barcodes` (item + barcodeGroup), `sell_prices` (item + price + priceGroup).
- `transaction_items` snapshots `name`/`unit`/`sellPrice`/`buyPrice` (varchar/numeric, not FKs) so receipts survive item/unit changes; `buyPriceId` (`ON DELETE SET NULL`) only feeds stock updates. The form carries `linkedBuyPrice: { id, price, stock } | null` (populated from the relation), mapped back by `transactions/transaction-item-mapper.ts`; `createTransaction`/`updateTransaction` strip it.
- `quantifiedSellPrice` = line sell total ("Qty price"): always numeric in the form, defaults to `sellPrice * quantity`, recomputed when either changes (manual edit resets); DB nullable for legacy rows. Use `quantifiedSellPrice(item)` (`lib/quantified-sell-price.ts`) in form defaults, recall, receipts. Editable by all users.
- `price_groups`: `hex_color` (6 chars, no `#`), `priority` (0), unique `name_index`.
- `settings`: singleton `id=1`; `listSettings()` returns nulls when missing, `updateSettings()` upserts.
- `user_settings.showDecimals` (default `false`) only controls `UserIdrInput`'s trailing `,00`, not `formatCurrency`/receipts.
- FKs: `ON UPDATE cascade ON DELETE cascade`, except `transaction_items.buyPriceId` (`SET NULL`) and `session`/`account.userId` (`ON DELETE cascade` only).
- Indexes: FK/scan indexes in `0006` (`transaction_items(transaction)`, `transactions(held, created_at)`, `buy_prices(item)`, `items(unit)`) and `0007` (`barcodes(barcode)`, the POS barcode lookup). Postgres doesn't index FK columns, so keep these when adding relations; `sell_prices`/`barcodes.item` are covered by their composite PK leading columns.

## Conventions

- **Path alias** `@/*` → repo root (`tsconfig.json`, `components.json`); import as `@/lib/...`, `@/components/...`, `@/contexts/...`, `@/app/...`.
- **shadcn** (`components.json`): style `radix-lyra`, **phosphor** icons (`@phosphor-icons/react`, `/ssr` in server components — see `app-sidebar/index.tsx`), primitives in `components/ui/`, Tailwind v4, CSS-variable theme, base `neutral`; `cn`/`cva` use `prettier-plugin-tailwindcss`.
- **Formatting**: prettier (no semicolons, double quotes, 2 spaces, trailing comma `es5`, width 80, LF); Biome mirrors it; eslint is `eslint-config-next`. Run `bun run format` after structural changes.
- **`"use server"`** tops `lib/crud/*.ts`, `lib/auth-guard.ts`, `lib/get-session.ts`, `lib/set-locale.ts`, `lib/print-trx-receipt.ts`, `lib/db/backup-restore.ts`.
- **Atomic changes**: small additive diffs; propose legacy cleanup separately. Each atomic change gets its own suggested commit message — one per response, listed up front only in Plan mode. See [Commits](#commits).
- **Decluttering**: hoist inline handlers/nested render helpers into named declarations before `return`; prefer a few small files.
- **Indicators** (each takes a required `tooltip: ReactNode` built at the call site with `next-intl` — `common.marginTooltip`, `common.mismatchTooltip`, `common.originalBuyPrice` ("Original buy price: {price}", via `formatCurrency`) — and spread onto `<TooltipContent>`):
  - `MarginIndicator` (`components/margin-indicator.tsx`): `margin`/`discount` from `marginAndDiscount(sell, buy)` (`lib/margin.ts` → `{ margin, discount }`; `discount` is a % guarded at `buy === 0`); renders `+X` and `(Y%)` for losses, no `Margin:` prefix; gate with `<AdminOnly>` + `showMarginAndDiscounts`. The footer `MarginBadge` is separate and does show `Margin:`.
  - `MismatchIndicator` (`components/mismatch-indicator.tsx`): flags `quantifiedSellPrice ≠ quantity × sellPrice`, `text-warning`, null at zero, not gated.
  - `BuyPriceMismatchIndicator` (`components/buy-price-mismatch-indicator.tsx`): `WarningIcon` when `buyPrice` differs from `originalBuyPrice`, null otherwise; used in the add-item bar (`addItemSnap.buyPrice.price`) and the buy-price cell (`linkedBuyPrice.price`).
- **Destructive colors**: `destructive` is the **fill** (`bg-destructive`, destructive variants) — never add `/10` opacity; `destructive-foreground` is the **ink** for `text-`/`border-`/`ring-`. Both invert light/dark, so `dark:bg-destructive` is redundant. Hover: `hover:brightness-95 dark:hover:brightness-110`. Tokens in `app/globals.css`; `text-/border-/ring-destructive` resolve to the fill — don't use them. `variant="destructive"` is unrelated.
- **Admin gating (client)**: `<AdminOnly>` (`components/admin-only.tsx`); `useIsAdmin()` (same file) for admin-conditioned values (`colSpan`, classes). Server checks (`lib/auth-guard.ts`, `(admin)` layout) are separate.
- **Delete confirmations**: use `<DeleteAlert>` (`components/delete-alert.tsx`) — presets destructive variant, `TrashIcon`, `common.delete` over `<Alert>`. Pass `trigger`, `action`, `title` (`<>{t("...delete")}?</>`), `description`; add `deleteDescription` to **both** locales. Only in-form row removals (`removeFieldValue`) skip it.
- **Translations**: `messages/{en-ID,id-ID}.json`; `getTranslations` (server) / `useTranslations`/`useLocale` (client). `bun run intl-check` finds unused keys (source `en-ID`); add keys to **both** locales.
- **Currency**: `formatCurrency` (`lib/i18n/currency.ts`, IDR 2 decimals); receipts use `Intl.NumberFormat("id-ID", {})` (no decimals).
- **IDR input**: use `UserIdrInput` (`components/user-idr-input.tsx`), not raw `IdrInput`, in app UI. It passes `showDecimals` (default `false`) from `useUserSettings()`; `IdrInput` keeps `decimalScale={2}` and only toggles `fixedDecimalScale`, so hidden decimals still render fractions (`1.234,56`). Raw `IdrInput` defaults `showDecimals` to `true`.
- **Type helpers** (reuse, don't redefine): `PartialKey<T,K>` (`lib/partial-keys.d.ts`), `DeepReadonly` (`lib/deep-read-only.d.ts`), `Mutable`/`DeepMutable` (`lib/mutable.d.ts`), `StateContext<T>` (`contexts/state-context.d.ts`).
- **Price group selection**: footer dropdown `Badge` (next to "Total price") in `app/(authorized)/transactions/price-group-badge.tsx`, fed by the form's `priceGroup`; `Ctrl+1`…`Ctrl+9` pick groups 1–9 (beyond 9 only via dropdown). `Ctrl+1`…`Ctrl+8` are browser tab shortcuts a plain browser may not release; desktop is Tauri.
- **Row reveal/blink**: adding an item (new row or merge, `idx !== -1`) calls `onItemAdded(index)` → `TransactionForm` bumps `itemSignal` (`{ index, token }`) → the matching `ItemRow` gets `itemToken` and blinks (custom `--animate-row-blink` in a plain `@theme` block in `app/globals.css`, since `tw-animate-css` only handles opacity/transform/filter) plus `scrollIntoView({ block: "nearest" })` (smooth unless reduced motion). Mounted rows blink via `blinkOnMount={!isFirstRender.current}` so opening a transaction doesn't flash; recall/reset never scroll. `scroll-mt-12 scroll-mb-32` clears the sticky header/footer; `ItemRow` clears `blinking` on `animationend` (ignoring bubbled events) so merges replay. `TableRow` has no `forwardRef`, but React 19 forwards `ref` through `...props` to `<tr>`.
- **Tests**: vitest, colocated `*.test.ts` (`format-cols`, `margin`, `quantified-sell-price`); only pure-logic utilities tested.

## Gotchas

- **First-user bootstrap**: the first user created through `/auth` becomes admin + active; later users default to `role="user"`, `active=false` and can't log in until an admin activates them (they land on `/auth/inactive`). Keep the `lib/auth.ts` hook intact.
- **`active` is a custom better-auth field** (`additionalFields`, `input: false`) — not settable via standard signup; only the `user.create.before` hook or an admin action flips it.
- **`transactions.id` is UUIDv7**; the printer shows `trx.id.slice(24)` (trailing 12 hex) as "Last ID" — don't change the slice without checking the receipt layout.
- **Sidebar collapse**: `user_settings.collapseSidebar` is two-way bound via `components/app-sidebar/persistent-sidebar-provider.tsx` (`SidebarProvider` is controlled); header toggles persist it, but `contexts/user-settings.tsx` suppresses the update toast because it is in `silentUserSettings`. Mobile sheet toggles (`openMobile`) don't persist.
- **Held/recall**: fetch held transactions with `listTransactions({ held: true, from: new Date(0), ... })` — the default 3-hour window would miss them. Recalling updates the held transaction in place rather than creating a new one.
- **`formatCols` prioritizes one column** (usually the rightmost/price column) and truncates the rest to fit; the overflow tests encode exact behavior. Re-run them if you change the width default.
- **`showHisotryItems`** [sic] in the `user_settings` column/defaults; **`defaultUserSetings`** [sic] in `lib/default-user-settings.ts`. Preserve the DB typo (or migrate it); the export typo is independent.
- **`next.config.mjs`**: `serverExternalPackages: ["usb"]` (native USB binding), `transpilePackages` includes `@t3-oss/env-nextjs` + `@t3-oss/env-core`, `output: "standalone"` (Dockerfile).
- **`instrumentation.ts`** imports `@/lib/env` and calls `migrateDb()` in `register()` to validate env and apply migrations at startup — don't remove.
- **`drizzle.config.ts`** lists both schema files and has no `out` override, so migrations land in `./drizzle` (what `migrateDb()` reads). `lib/db/index.ts` merges `schema + relations + authSchema` so `db.query.*` spans both.
- **i18n-check source locale is `en-ID`** — add keys there first.
- **`@types/react` has `DragEvent` but no `DropEvent`** — use `DragEvent<HTMLElement>` for both drag and drop handlers.
- **Transaction item selection**: `selected` in `TransactionForm` is a `Set` of item indices. Reset it with `resetTransactionForm()` on form resets/recall cancel, clear it when replacing items on recall, and remap it on drag reorder (`remapSelectedAfterMove`); otherwise checkboxes and the remove button target the wrong rows.
