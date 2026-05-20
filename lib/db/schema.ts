import {
  pgTable,
  uuid,
  varchar,
  foreignKey,
  primaryKey,
  numeric,
  timestamp,
  uniqueIndex,
  integer,
  boolean,
} from "drizzle-orm/pg-core"
import { sql } from "drizzle-orm"
import { v7 } from "uuid"

export const items = pgTable(
  "items",
  {
    id: uuid()
      .primaryKey()
      .notNull()
      .$defaultFn(() => v7()),
    name: varchar().notNull(),
    unit: uuid().notNull(),
  },
  (table) => [
    foreignKey({
      columns: [table.unit],
      foreignColumns: [units.id],
      name: "units_fk",
    })
      .onUpdate("cascade")
      .onDelete("cascade"),
  ]
)

export const units = pgTable("units", {
  id: uuid()
    .primaryKey()
    .notNull()
    .$defaultFn(() => v7()),
  name: varchar().notNull(),
})

export const barcodeGroups = pgTable("barcode_groups", {
  id: uuid()
    .primaryKey()
    .notNull()
    .$defaultFn(() => v7()),
  name: varchar().notNull(),
})

export const barcodes = pgTable(
  "barcodes",
  {
    item: uuid("item").notNull(),
    barcodeGroup: uuid("barcode_group").notNull(),
    barcode: varchar().notNull(),
  },
  (table) => [
    foreignKey({
      columns: [table.item],
      foreignColumns: [items.id],
      name: "items_fk",
    })
      .onUpdate("cascade")
      .onDelete("cascade"),
    foreignKey({
      columns: [table.barcodeGroup],
      foreignColumns: [barcodeGroups.id],
      name: "barcode_group_fk",
    })
      .onUpdate("cascade")
      .onDelete("cascade"),
    primaryKey({
      columns: [table.item, table.barcodeGroup],
      name: "barcodes_pkey",
    }),
  ]
)

export const priceGroups = pgTable(
  "price_groups",
  {
    id: uuid()
      .primaryKey()
      .notNull()
      .$defaultFn(() => v7()),
    name: varchar().notNull(),
    hexColor: varchar("hex_color", { length: 6 }).notNull(),
    description: varchar(),
    priority: integer().default(0),
  },
  (table) => [uniqueIndex("name_index").on(table.name)]
)

export const buyPrices = pgTable(
  "buy_prices",
  {
    id: uuid()
      .notNull()
      .primaryKey()
      .$defaultFn(() => v7()),
    item: uuid("item").notNull(),
    price: numeric({ mode: "number" }).notNull(),
    stock: integer().notNull().default(0),
    createdAt: timestamp("created_at", { withTimezone: true, mode: "string" })
      .default(sql`CURRENT_TIMESTAMP`)
      .notNull(),
  },
  (table) => [
    foreignKey({
      columns: [table.item],
      foreignColumns: [items.id],
      name: "items_fk",
    })
      .onUpdate("cascade")
      .onDelete("cascade"),
  ]
)

export const sellPrices = pgTable(
  "sell_prices",
  {
    item: uuid("item").notNull(),
    price: numeric({ mode: "number" }).notNull(),
    priceGroup: uuid("price_group").notNull(),
  },
  (table) => [
    foreignKey({
      columns: [table.item],
      foreignColumns: [items.id],
      name: "items_fk",
    })
      .onUpdate("cascade")
      .onDelete("cascade"),
    foreignKey({
      columns: [table.priceGroup],
      foreignColumns: [priceGroups.id],
      name: "price_group_fk",
    })
      .onUpdate("cascade")
      .onDelete("cascade"),
    primaryKey({
      columns: [table.item, table.price, table.priceGroup],
      name: "sell_prices_pkey",
    }),
  ]
)

export const transactions = pgTable("transactions", {
  id: uuid()
    .notNull()
    .primaryKey()
    .$defaultFn(() => v7()),
  cashier: varchar().notNull(),
  totalPrice: numeric("total_price", { mode: "number" }).notNull(),
  customerPriceGroup: varchar("customer_price_group").notNull(),
  held: boolean().default(false).notNull(),
  createdAt: timestamp("created_at", { withTimezone: true, mode: "string" })
    .default(sql`CURRENT_TIMESTAMP`)
    .notNull(),
})

export const transactionItems = pgTable(
  "transaction_items",
  {
    transaction: uuid().notNull(),
    name: varchar().notNull(),
    unit: varchar().notNull(),
    sellPrice: numeric("sell_price", { mode: "number" }).notNull(),
    quantity: integer().notNull(),
    buyPrice: numeric("buy_price", { mode: "number" }).notNull(),

    // for updates and recalls
    buyPriceId: uuid("buy_price_id"),
    updateStock: boolean().default(false).notNull(),
  },
  (table) => [
    foreignKey({
      columns: [table.transaction],
      foreignColumns: [transactions.id],
      name: "transactions_fk",
    })
      .onUpdate("cascade")
      .onDelete("cascade"),
    foreignKey({
      columns: [table.buyPriceId],
      foreignColumns: [buyPrices.id],
      name: "buy_prices_fk",
    })
      .onUpdate("cascade")
      .onDelete("set null"),
  ]
)
