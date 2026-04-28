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
} from "drizzle-orm/pg-core"
import { sql } from "drizzle-orm"

export const items = pgTable("items", {
  id: uuid().primaryKey().notNull().defaultRandom(),
  name: varchar().notNull(),
})

export const priceGroups = pgTable(
  "price_groups",
  {
    id: uuid().primaryKey().notNull().defaultRandom(),
    name: varchar().notNull(),
  },
  (table) => [uniqueIndex("name_index").on(table.name)]
)

export const prices = pgTable(
  "prices",
  {
    item: uuid("item").notNull(),
    price: numeric({ mode: "number" }).notNull(),
    priceGroup: uuid("price_group").notNull(),
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
    foreignKey({
      columns: [table.priceGroup],
      foreignColumns: [priceGroups.id],
      name: "price_group_fk",
    })
      .onUpdate("cascade")
      .onDelete("cascade"),
    primaryKey({
      columns: [table.item, table.price, table.priceGroup, table.createdAt],
      name: "prices_pkey",
    }),
  ]
)

export const transactions = pgTable("transactions", {
  id: uuid().notNull().primaryKey().defaultRandom(),
  totalPrice: numeric("total_price", { mode: "number" }).notNull(),
  customerPriceGroup: varchar("customer_price_group").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true, mode: "string" })
    .default(sql`CURRENT_TIMESTAMP`)
    .notNull(),
})

export const transactionItems = pgTable(
  "transaction_items",
  {
    transaction: uuid().notNull(),
    name: varchar().notNull(),
    unitPrice: numeric("unit_price", { mode: "number" }).notNull(),
    quantity: integer().notNull(),
    quantifiedPrice: numeric("quantified_price", { mode: "number" }).notNull(),
  },
  (table) => [
    foreignKey({
      columns: [table.transaction],
      foreignColumns: [transactions.id],
      name: "transactions_fk",
    })
      .onUpdate("cascade")
      .onDelete("cascade"),
    primaryKey({
      columns: [table.name, table.transaction],
      name: "transaction_items_pk",
    }),
  ]
)
