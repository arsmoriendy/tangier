import { relations } from "drizzle-orm/relations"
import { items, prices, customerTiers } from "./schema"

export const pricesRelations = relations(prices, ({ one }) => ({
  item: one(items, {
    fields: [prices.itemId],
    references: [items.id],
  }),
  customerTier: one(customerTiers, {
    fields: [prices.customerTierId],
    references: [customerTiers.id],
  }),
}))

export const itemsRelations = relations(items, ({ many }) => ({
  prices: many(prices),
}))

export const customerTiersRelations = relations(customerTiers, ({ many }) => ({
  prices: many(prices),
}))
