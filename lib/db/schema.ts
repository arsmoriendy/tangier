import {
  pgTable,
  uuid,
  varchar,
  bigint,
  foreignKey,
  primaryKey,
  numeric,
  timestamp,
  uniqueIndex,
} from "drizzle-orm/pg-core"
import { sql } from "drizzle-orm"

export const items = pgTable("items", {
  id: uuid().primaryKey().notNull().defaultRandom(),
  name: varchar().notNull(),
  // You can use { mode: "bigint" } if numbers are exceeding js number limitations
  stock: bigint({ mode: "number" }).default(0).notNull(),
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
    price: numeric().notNull(),
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
