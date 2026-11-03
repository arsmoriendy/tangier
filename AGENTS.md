# AGENTS.md

Point-of-sale (POS) application for a retail business, built with Next.js 16 (App Router), React 19, Drizzle ORM (PostgreSQL), and `better-auth`. Targets a USB ESC/POS thermal receipt printer (default Epson VID `0x04b8` / PID `0x0202`). Currency is hardcoded to IDR (`id-ID`) throughout. UI is bilingual (`en-ID`, `id-ID`) via `next-intl`, locale stored in a `locale` cookie.

## Maintaining this file

Anything learned while working on this codebase — new conventions, gotchas, commands, architecture, or corrections to what's written here — **must** be added to this file so future agents benefit. Keep entries concise, accurate, and grouped under the existing sections; update or remove entries that become stale.

## Asking the user for decisions

When a task requires choosing between known alternatives, prompt the user with **structured options** (concrete labels, a one-line description each, and the recommended option first) rather than an open-ended question. Reserve open-ended prompts for clarifying _what_ to build, not _which_ of several known options to take.

## Commands

Package manager is **bun** (`bun.lock` is authoritative). Stale `package-lock.json` and `pnpm-lock.yaml` also exist at the repo root; ignore/remove them rather than using npm or pnpm. On Arch/NixOS the `usb` native dependency needs the dev shell from `flake.nix` (`nix develop`) plus `node-gyp build` inside `node_modules/usb`; on other systems apply the udev rule from `README.md`.

```bash
bun install                 # install deps
bun -b dev                  # dev server (turbopack) — use bun runtime, see README
bun run build               # build; sets SKIP_ENV_VALIDATION=1 and assembles standalone output
bun run start               # start built server
bun run test                # vitest, verbose reporter
bun run typecheck           # tsc (type-check only; tsconfig has noEmit)
bun run lint                # eslint
bun run format              # prettier --write on ts/tsx/css
bun run intl-check          # find unused i18n keys (source locale en-ID)
```

**Agents: do not run `bun run lint` or start the app/dev server (`bun run dev`, `bun run start`, `bun run build`). The user handles linting and running the program; skip these unless explicitly asked.**

`build` copies `public/`, `.next/static`, and `drizzle/` into `.next/standalone/` — the Docker image (`oven/bun:alpine`) runs `./server.js` from the standalone output. The Dockerfile also installs `libudev-zero` (USB) and `postgresql18-client` (backup/restore via `pg_dump`/`psql`). Do not change this assembly step unless you also update the Dockerfile.

Drizzle migrations are managed with `drizzle-kit` (config in `drizzle.config.ts`, dialect `postgresql`, output dir `./drizzle`; there is no `out` override). Schemas live in `lib/db/schema.ts` (app tables) and `lib/db/auth-schema.ts` (better-auth tables). `lib/db/migrate-db.ts` runs them (`migrationsFolder: "drizzle"`) and is invoked from `instrumentation.ts`. Env validation is via `@t3-oss/env-nextjs` (`lib/env.ts`) — `SKIP_ENV_VALIDATION=1` bypasses it (used by `build`).

## Secrets

`secrets.json` is **SOPS-encrypted** (AES256_GCM, PGP key `4608BD8B17ABEE9F0DB5DE4AC2333D93F6D7C06F`). It contains `DATABASE_URL`, `BETTER_AUTH_SECRET`, `BETTER_AUTH_URL`. Decrypt with SOPS before running locally; never commit plaintext. Required server env vars: `DATABASE_URL`, `BETTER_AUTH_SECRET` (min 32 chars), `BETTER_AUTH_URL` (validated as URL). Printer vars (`PRINTER_VID`, `PRINTER_PID`, `PRINTER_WIDTH`) default to the Epson values above and are optional.

## Architecture & control flow

### Route groups (App Router)

- `app/auth/` — unauthenticated sign-in/sign-up; also `auth/inactive/` for users with `active=false` (the `getSessionOrRedirect` helper redirects inactive users here).
- `app/(authorized)/` — everything behind `getSessionOrRedirect()` (requires session + `user.active`). Wrapped by `SessionProvider` + `UserSettingsProvider` + `SidebarProvider` + `AppSidebar` in its layout. The layout fetches the current user's settings via `getUserSettings({ userId: session.user.id })` and seeds the provider with them.
- `app/(authorized)/(admin)/` — admin-only subtree; its layout calls `getSessionOrRedirect({ admin: true })`, which redirects inactive users to `/auth/inactive` and non-admins/no-session to `/auth`. Contains `items`, `units`, `price-groups`, `barcode-groups`, `users`, and `backup-restore`. The sidebar only renders these links for admins.
- `app/(authorized)/transactions/` — the core POS UI (`new/` for the live transaction form, `history/` for past transactions + reports). Available to all authorized users.
- `app/(authorized)/options/` — app settings and receipt header/footer editing. Authorized for all users; some user-settings controls are admin-gated, but the receipt fields are not.
- `app/page.tsx` redirects to `/transactions/new`.
- `app/api/auth/[...all]/route.ts` — better-auth HTTP handler (`toNextJsHandler`).
- `app/api/backup/route.ts` and `app/api/restore/route.ts` — admin-only (`isUnauthorized({ admin: true })`) SQL dump/restore endpoints. They use `pg_dump`/`psql`; restore also runs `migrateDb()`.
- **Desktop (Tauri)**: several components branch on `isTauri()`. The backup form uses Tauri save/download plugins and `authClient.token()` bearer auth; the client exit menu is Tauri-only.

### Server / client boundary

- **Server actions** are the main app data layer. Every file in `lib/crud/*.ts` starts with `"use server"` and exports async CRUD functions that call `db` directly. Components call these server actions directly (e.g. `createTransaction`, `listItems`). Auth uses `better-auth`'s client; backup/restore uses API routes. There is no separate app-data API client.
- **Server actions are not individually authorized**: they do not call `getSessionOrRedirect`/`isUnauthorized` themselves; layout/page guards only protect navigation. The README backlog lists "Server function authorization" as TODO. Treat actions as trusted only after adding checks.
- `lib/get-session.ts` and `lib/auth-guard.ts` are also `"use server"`. `getSessionOrRedirect(...)` is called in the `(authorized)` layout (`getSessionOrRedirect()`) and the `(admin)` layout (`getSessionOrRedirect({ admin: true })`). `isUnauthorized(...)` returns `Response.json({ error: "Unauthorized" }, { status: 401 })` and is used by API routes.
- `lib/get-session.ts` first verifies an `Authorization: Bearer` JWT via `jose`/JWKS (`${BETTER_AUTH_URL}/api/auth/jwks`, issuer/audience `BETTER_AUTH_URL`); on failure it falls back to `auth.api.getSession({ headers })`.
- `lib/auth.ts` configures `better-auth` with the drizzle adapter, the `admin()` and `jwt()` plugins, email/password (min password length **3**), and `user.changeEmail` / `user.deleteUser` config. A `databaseHooks.user.create.before` hook **auto-promotes the first user to admin and marks them active** — this is how the system bootstraps its first admin. The `beforeDelete` hook prevents deleting the sole admin.
- Client auth uses `lib/auth-client.ts` (`createAuthClient` with `inferAdditionalFields`, `adminClient`, and `jwtClient`). Admin user management and Tauri backup token retrieval call `authClient.admin.*` / `authClient.token()` directly.

### Context providers

State is split between React Context and **valtio** proxies. There are two provider trees:

1. **Root layout** (`app/layout.tsx`) wraps everything in: `ThemeProvider` (next-themes, class attribute) → `LocalStorageProvider` → `NextIntlClientProvider` → `I18nProvider` (react-aria i18n) → `TooltipProvider` → `ZodConfig` (binds zod locale to next-intl locale) → children + `<Toaster/>`.
2. **Per-page providers** (server components, e.g. `transactions/new/page.tsx`) fetch initial data via server actions, then wrap client children in `PriceGroupsProvider`, `UnitsProvider`, `ItemsProvider`, `HeldProvider`, `TrxProvider`, `FiltersProvider`, etc. Each page composes only the providers it needs.

Contexts are not uniform. `ValtioContext<T> = { proxy: T; snap: Snapshot<T> }` (see `contexts/valtio-context.d.ts`) is used by Items, Held, Trx, Filters, UserSettings, and LocalStorage; those hooks expose `{ setX: proxy, getX: snap }`-style accessors. PriceGroups, Units, and BarcodeGroups use React's `StateContext<T>` (`{ state, setState }` via `useState`). Session is plain React context.

`LocalStorageProvider` persists a valtio proxy to `localStorage["tangierStore"]` via `subscribe`. Its zod schema is currently empty (`z.object({})`), so it stores `{}`; the former UI preferences moved to the `user_settings` DB table.

`UserSettingsProvider` (`contexts/user-settings.tsx`) is a valtio-backed `ValtioContext<UserSettings>` used via `useUserSettings()` → `{ getUserSettings: snap, setUserSettings: proxy }`. It is seeded from the `user_settings` DB row in the `(authorized)` layout. Its subscription **persists changed keys** via `upsertUserSettings` and toasts success; call sites mutate it imperatively (`setUserSettings.x = c`).

`SessionProvider` is React-only (no valtio) and just holds the server-resolved session for `useSession()`.

### Forms

Most app forms use **TanStack React Form** via the shared hook in `components/form.tsx`. Exceptions: the backup/restore forms are native HTML forms for file download/upload:

```ts
export const { useAppForm, withForm } = createFormHook({
  fieldComponents: { TextField, NumberField, IdrField, TextareaField },
  formComponents: { SubmitButton },
  ...
})
```

To add a new field type, register it in `components/form.tsx`'s `fieldComponents` (or `formComponents` for form-level components) — otherwise `form.AppField` won't have it. Field components consume `useFieldContext()` / `useFormContext()` from the same hook. `components/text-field.tsx`, `idr-field.tsx`, etc. are the canonical examples. The `<Form>` wrapper takes a `handleSubmit` prop (not `onSubmit`).

Zod schemas typically live next to the form (e.g. `transaction-schema.ts`, `add-item-schema.ts`) and are passed as `validators: { onMount, onChange }`. `lib/zod-config.tsx` is a client component that re-runs `z.config()` whenever the next-intl locale changes, so zod error messages localize.

`withForm` does **not** provide the form through React context (`form.AppForm`/`form.AppField` only provide `formContext`/`fieldContext` to their own children, and `withForm`'s returned component neither creates a form nor wraps a provider). To split a form UI into reusable subcomponents, make the child its own `withForm` component (same `defaultValues`) and pass the parent's `form` as an explicit prop — see `transaction-item-table/` (`index.tsx` table shell → `item-row.tsx`, with `item-row-dnd.ts` drag handlers and `form-helpers.ts` for shared field helpers like `setIdempotentFieldValue`/`recalculateTotalPrice`). Doing this also avoids redefining a nested component inside `render` (which remounts on every render and drops input focus). Keep such helpers structurally typed rather than reaching for the concrete TanStack form type.

### Add-item entry (transaction form)

`add-item-form.tsx` is a single wrapping row (`SearchItemForm` + the add-item `<Form>`, both siblings inside the bar — the two `<form>`s are never nested). It is rendered by `TransactionFooter` (`transaction-footer.tsx`) **inside the first bar of the footer** (`<FooterBar><AddItemProvider><AddItemForm form={form}/></AddItemProvider></FooterBar>`), not above the item table. The recorded **buy price is a `WrappedCombobox`** over `addItem.buyPrices` (`formatCurrency(price)` + `common.stockLeft` in `renderOption`) with `IdrInput` as its `renderInput`. Typing edits the form's `buyPrice` but deliberately does **not** feed the filter (no `setInputValue` call), so the list always shows every recorded price. Picking one sets `addItemProxy.buyPrice` and the form's `buyPrice`; re-pressing the selected one clears `addItemProxy.buyPrice` (`linkedBuyPrice` becomes null, so that line does not decrement stock) while keeping the typed price. Admin-only, gated by `showTrxBuyPrice`. A typed price that differs from the selected recorded price is flagged by `components/buy-price-mismatch-indicator.tsx`.

The footer is the module-level `TransactionFooter` `withForm` component (`transaction-footer.tsx`, alongside its `FooterBar`/`RecallBadge`/`MarginBadge` helpers), which receives the transaction `form`, selection state (`selected`/`setSelected`), recall state (`recalledTrx`/`setRecalledTrx`, `openRecallDialog`/`setOpenRecallDialog`), and the `onHold`/`onCancelRecall` callbacks (plus `hideHoldRecall`) as props. Keeping it at module scope is deliberate: a `Footer`/`Bar` function redefined inside `TransactionForm` would remount on every `TransactionForm` re-render (React reconciles by element-type identity, so a new function reference means a new component type), discarding the `AddItemForm`'s TanStack form state stored in `useState` — e.g. toggling "Show summary" (which mutates user settings) or selecting a table row would clear in-progress add-item input. Hoisting keeps type identity stable so React re-renders in place instead. Do **not** reintroduce footer helper components inside `TransactionForm`'s render body.

### Wrapped combobox

`components/wrapped-combobox.tsx` wraps Base UI's single-select `Combobox` over an unconstrained option type `O`. `option` (`null` = none, `undefined` = uncontrolled) and `input` are independent except for two rules: picking an option writes its label into the input, and typing filters the options. Picking the already-selected option toggles it off (Base UI always reports item presses, even for the current selection). To hold that independence, `onInputValueChange` only accepts the `input-change`/`input-paste` reasons and `onValueChange(null)` is ignored — Base UI emits it when the input is emptied or on Escape. The option→input sync is an effect keyed on the serialized option key (`getOptionValue(option)`, derived from `optionToValue` when provided) with a deliberate `exhaustive-deps` disable: the projector props are inline arrows, so depending on them would re-run it and wipe the typed text.

`renderInput` replaces the default input and its `InputGroup` chrome with any control (`Input`, `IdrInput`, `NumberInput`, …). It receives `value`/`setInputValue` (event-free — `inputValue` is controlled, so no DOM event is needed), `invalid`/`disabled`/`placeholder`, and `domProps` (Base UI's input props with `value`/`onChange` stripped; a function `render` gets no automatic prop merging, hence the manual assembly). The control must spread `domProps` onto the real `<input>` or the popup anchor and keyboard navigation break, and must not also wire a native `onChange` (it would double-fire against `setInputValue`). Because the custom path bypasses Base UI's change handler, `open` is controlled by the component and `setInputValue` opens the list on non-empty input. `openOnFocus` (default `true`) opens the list from the input's focus handler, since Base UI only opens on mousedown (`openOnInputClick`); this is safe because `ComboboxItem` calls `preventDefault()` on pointerdown/mousedown, so selecting an item never blurs the input and cannot re-trigger the focus handler.

`contentProps` forwards to `<ComboboxContent>`: `className`, `side`, `align`, `sideOffset`, `alignOffset`, `anchor`. The popup's default width is the anchor's (`w-(--anchor-width)` plus a `min-w` of anchor+28px), so widening only needs `w-*` while narrowing needs both `w-*` and `min-w-*`; positioning is the Positioner's `side`/`align`/`sideOffset`/`alignOffset`, with collision flipping handled by floating-ui.

The `renderInput` path does **not** get `aria-invalid` for free (only the default `ComboboxInput` branch applies the `invalid` prop): call sites must pass `invalid` to `WrappedCombobox` and forward it in the renderer (e.g. `aria-invalid={invalid || undefined}` after the `domProps` spread), and never map it to `disabled` — an empty required field is invalid from mount. Controls rendered from `form.Subscribe` (not `form.AppField`) have no `field` for validity; read `state.fieldMeta.<name>.isValid` in the selector instead. That value is `undefined` until the form's `onMount` validation populates `fieldMeta`, so compare `isValid === false` rather than negating it, or the control renders invalid on the first render.

### Receipt printing

`lib/print-trx-receipt.ts` is a `"use server"` module that opens the USB device via `@node-escpos/usb-adapter` using `env.PRINTER_VID/PID` and prints with `@node-escpos/core`. Receipt width comes from `env.PRINTER_WIDTH` (default 33 columns). Header/footer text comes from the singleton `settings` row (id=1) in the DB, edited via the receipt section on the authorized `/options` page (`app/(authorized)/options/`); the receipt fields are not admin-gated. The former standalone `/receipt` admin route was removed. Column layout uses `lib/format-cols.ts` (tested by `format-cols.test.ts`). Printing is best-effort — the transaction form wraps `printTrxReceipt` in try/catch and shows a sonner toast on failure.

### Stock handling

`buy_prices.stock` is decremented per-transaction. Form transaction items carry a `linkedBuyPrice` object and an `updateStock` flag (persisted rows carry `buyPriceId`); the transaction form aggregates quantities per `buyPriceId` (accounting for the previous quantity on edits/recalls) and calls `updateBuyPriceStock({ id, stockDelta })`, which uses a SQL `stock + ${stockDelta}` update. Held transactions do not touch stock.

## DB schema notes

- App IDs are **UUIDv7** (`uuid().$defaultFn(() => v7())`); better-auth IDs are `text` (generated by better-auth).
- Composite primary keys: `barcodes` (item + barcodeGroup), `sell_prices` (item + price + priceGroup).
- `transaction_items` stores **snapshots** of `name`, `unit`, `sellPrice`, `buyPrice` (varchar/numeric, not FKs) so historical receipts stay intact when items/units change. `buyPriceId` is an FK to `buy_prices` with `ON DELETE SET NULL` — used only for stock updates. The **transaction form** does not carry `buyPriceId`; it carries `linkedBuyPrice: { id, price, stock } | null` (`transactionSchema`), populated from the `linkedBuyPrice` relation on transaction queries and mapped back to `buyPriceId` by `app/(authorized)/transactions/transaction-item-mapper.ts` before persistence. `createTransaction`/`updateTransaction` strip `linkedBuyPrice` from inserted rows.
- `transaction_items.quantifiedSellPrice` is the line's sell total (the "Qty price" column). In the form it is always numeric and defaults to `sellPrice * quantity`, recomputed whenever sell price/quantity changes (a manual edit is reset by those changes); the DB column is nullable so legacy rows fall back. Use `quantifiedSellPrice(item)` from `lib/quantified-sell-price.ts` (form defaults, recall, and the receipt) rather than recomputing. It is editable by all users (not admin-gated). The former form-only `extraFields.quantifiedPrice` was replaced by this persisted field, so `extraFields` is no longer used.
- `price_groups` has a `hex_color` (6-char varchar, no `#`), `priority` (default 0), and a unique `name_index`. The transaction form's price-group picker is `PriceGroupBadge` in the footer (see Conventions), not `RadioGroupChoiceCard`.
- `settings` is a singleton row with `id=1`; `listSettings()` returns nulls if the row is missing, `updateSettings()` upserts.
- All foreign keys use `ON UPDATE cascade ON DELETE cascade` except `transaction_items.buyPriceId` (`SET NULL`) and `session`/`account.userId` (`ON DELETE cascade` only).

## Conventions

- **Path alias**: `@/*` → repo root (configured in `tsconfig.json` and `components.json`). Use `@/lib/...`, `@/components/...`, `@/contexts/...`, `@/app/...`.
- **shadcn** config (`components.json`): style `radix-lyra`, icon library **phosphor** (`@phosphor-icons/react`, with `/ssr` subpath for server components — see `app-sidebar/index.tsx`). UI primitives live in `components/ui/`. Tailwind v4, CSS variables for theme, base color `neutral`. `cn` and `cva` are registered with `prettier-plugin-tailwindcss`.
- **Formatting**: prettier (no semicolons, double quotes, 2-space indent, trailing comma `es5`, print width 80, LF). Biome is also configured (`biome.json`) with matching style and recommended lint rules; eslint uses `eslint-config-next` (core-web-vitals + TS). Run `bun run format` after structural changes.
- **"use server"** directive is at the top of every `lib/crud/*.ts`, `lib/auth-guard.ts`, `lib/get-session.ts`, `lib/set-locale.ts`, `lib/print-trx-receipt.ts`, and `lib/db/backup-restore.ts`. Keep new server-action files consistent.
- **Atomic changes**: prefer small, additive, focused diffs over drive-by refactors. Leave adjacent legacy scaffolding in place and propose its cleanup as a separate change rather than folding it into an unrelated one.
- **Decluttering**: when the user asks to "declutter" a component, pull functions out of the JSX (inline arrow/event handlers, nested render helpers) into named declarations placed **before** the `return`, and hoist render-body helpers/components out of the render function where practical. Prefer a few small focused files over one large one.
- **Margin indicators**: the inline per-line display is `components/margin-indicator.tsx` (`<MarginIndicator sell buy tooltip />`; derives `margin`/`discount` internally via `marginAndDiscount`, returns `null` at zero). It renders `+X` and, for losses, `(Y%)` — it has no `Margin:` prefix. Gate it with `<AdminOnly>` + `showMarginAndDiscounts`. Margin/discount math comes from `marginAndDiscount(sell, buy)` in `lib/margin.ts` (returns `{ margin, discount }`, `discount` is a % guarded at `buy === 0`; profit/loss is just its `margin`). The footer total `MarginBadge` in `transaction-footer.tsx` is a separate presentation and renders the `Margin:` prefix.
- **Mismatch indicator**: a manual override of the line sell total (`quantifiedSellPrice ≠ quantity × sellPrice`) is shown by `components/mismatch-indicator.tsx` (`<MismatchIndicator sellPrice quantity quantifiedSellPrice tooltip />`; derives the mismatch, `text-warning`, returns `null` at zero, not gated).
- **Buy-price mismatch indicator**: `components/buy-price-mismatch-indicator.tsx` (`<BuyPriceMismatchIndicator buyPrice originalBuyPrice tooltip className />`) shows a `WarningIcon` when the editable buy price differs from the recorded/linked buy price. It returns `null` when `originalBuyPrice` is null or equal. Used in the add-item bar (`addItemSnap.buyPrice.price`) and the item table's buy-price cell (`linkedBuyPrice.price`); tooltip text is `common.originalBuyPrice` ("Original buy price: {price}") built at the call site with `formatCurrency`.
- **Indicator tooltips**: the indicator components take a required `tooltip: ReactNode` built **at the call site** with `next-intl` (`common.marginTooltip` → "Margin (and discount)"; `common.mismatchTooltip` → "Mismatch"/"Selisih"; `common.originalBuyPrice` → "Original buy price: {price}"), and spread extra props onto `<TooltipContent>` (e.g. `align`, `side`, `sideOffset`). The tooltip names the indicator only (no equation/result).
- **Destructive colors**: `destructive` is the **background/fill** of a destructive variant and any destructive-tinted surface (`bg-destructive`); do not add an opacity postfix (`bg-destructive/10`) — the token is already the intended tint. `destructive-foreground` is the red **ink** used for `text-`/`border-`/`ring-` utilities (and as the text on a `bg-destructive`). Both are theme-aware and invert between light and dark, so `dark:bg-destructive` overrides are redundant. Interaction feedback uses `hover:brightness-95 dark:hover:brightness-110` rather than an opacity change. The two tokens are defined in `app/globals.css`; do not use `text-destructive`/`border-destructive`/`ring-destructive` (those now resolve to the fill color). The `variant="destructive"` prop value on Button/Badge/DropdownMenuItem is unrelated and stays as-is.
- **Admin gating (client)**: gate client-rendered admin-only UI with `<AdminOnly>` (`components/admin-only.tsx`, default export); use the `useIsAdmin()` hook (same file) for admin-conditioned _values_ (e.g. `colSpan`, class names). Server-side role checks (`lib/auth-guard.ts`, the `(admin)` layout) are separate and unchanged.
- **Delete confirmations**: wrap every destructive delete in `<DeleteAlert>` (`components/delete-alert.tsx`) — it presets the destructive action variant, `TrashIcon`, and the `common.delete` label on top of the generic `<Alert>` (`components/alert.tsx`). Pass `trigger` (usually a destructive `Button`), `action`, `title` (typically `<>{t("...delete")}?</>`), and `description`; add the `deleteDescription` key to **both** locales. Only in-form row removals (e.g. `removeFieldValue`) skip the confirmation.
- **Translations**: message JSON files in `messages/{en-ID,id-ID}.json`. Server components use `getTranslations(...)` from `next-intl/server`; client components use `useTranslations(...)` / `useLocale()`. Run `bun run intl-check` to catch unused keys. When adding a key, add it to **both** locale files.
- **Currency/number formatting**: `lib/i18n/currency.ts` exports `formatCurrency` (IDR, 2 decimals); `lib/print-trx-receipt.ts` uses a separate `Intl.NumberFormat("id-ID", {})` (no decimals) for receipts — match the context when formatting numbers.
- **Type helpers**: `lib/partial-keys.d.ts` (`PartialKey<T,K>`), `lib/deep-read-only.d.ts` (`DeepReadonly`), `lib/mutable.d.ts` (`Mutable`, `DeepMutable`), `contexts/state-context.d.ts` (`StateContext<T>`). Use these instead of redefining.
- **Price group selection (transaction form)**: the picker is a dropdown `Badge` in the footer's badge row (next to the "Total price" badge), not the old top-of-form `RadioGroupChoiceCard`. It lives in `app/(authorized)/transactions/price-group-badge.tsx` (`<PriceGroupBadge value onChange />`, value/onChange passed from the form's `priceGroup` field). It registers `Ctrl+1`…`Ctrl+9` to pick the 1st–9th price group; groups beyond the 9th are only reachable via the dropdown. Note `Ctrl+1`…`Ctrl+8` are browser tab-switch shortcuts that a plain browser may not let a page intercept; the desktop wrapper is Tauri.
- **Tests**: vitest, colocated `*.test.ts` next to the module (see `lib/format-cols.test.ts`, `lib/margin.test.ts`, `lib/quantified-sell-price.test.ts`). Only pure-logic utilities are currently tested.

## Gotchas

- **First-user bootstrap**: the very first user created through `/auth` is automatically made admin + active; subsequent users default to `role="user"`, `active=false` and cannot log in until an admin activates them (they hit `/auth/inactive`). Keep this hook in `lib/auth.ts` intact.
- **`active` is a custom better-auth field** (`additionalFields`, `input: false`) — it is **not** settable through the standard better-auth client signup flow; only the `user.create.before` hook or an admin action flips it.
- **Admin guard uses the same helper**: the `(admin)` layout calls `getSessionOrRedirect({ admin: true })`; it redirects inactive users to `/auth/inactive` and non-admins/no-session to `/auth`. There is no separate `authGuard` function.
- **`transactions.id` is UUIDv7**; the receipt printer slices `trx.id.slice(24)` to show only the trailing 12 hex chars as the "Last ID" on receipts. Don't change the slice without checking the printer layout.
- **Held/recall flow**: `listTransactions({ held: true, from: new Date(0), ... })` is used to fetch held transactions (note the epoch `from` — the default 3-hour window would miss them). Recalling updates an existing held transaction in place rather than creating a new one.
- **`formatCols` prioritizes one column** (usually the rightmost/price column) and truncates the others to fit the printer width; the overflow tests in `format-cols.test.ts` encode the exact behavior. If you change the width default, re-run those tests.
- **`showHisotryItems`** [sic] is misspelled in the `user_settings` DB column/default settings; `defaultUserSetings` [sic] is also misspelled in `lib/default-user-settings.ts`. Preserve the DB column typo or migrate it; the export typo can be fixed independently. `LocalStorageProvider` no longer stores these preferences.
- **`next.config.mjs`**: `serverExternalPackages: ["usb"]` is required for the native USB binding; `transpilePackages` includes `@t3-oss/env-nextjs` and `@t3-oss/env-core`. `output: "standalone"` is required by the Dockerfile.
- **`instrumentation.ts`** imports `@/lib/env` and runs `migrateDb()` in `register()` to validate env vars and apply migrations at server startup. Don't remove this or env vars won't be validated in production.
- **`drizzle.config.ts`** lists both schema files explicitly and has no `out` override, so migrations go to `./drizzle` (the folder `migrateDb()` reads). `lib/db/index.ts` merges `schema + relations + authSchema` into one `drizzle()` call so `db.query.*` can use relational queries across both schemas.
- **i18n-check source locale is `en-ID`** — add new keys to `en-ID.json` first or the check will complain.
- **`@types/react` exports `DragEvent` but not `DropEvent`** — use `DragEvent<HTMLElement>` for both drag and drop handlers; `DropEvent` does not exist in React's types.
