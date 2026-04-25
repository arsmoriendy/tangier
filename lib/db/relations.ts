import { relations } from "drizzle-orm/relations"
import {
  items,
  prices,
  priceGroups,
  transactions,
  transactionItems,
} from "./schema"

export const pricesRelations = relations(prices, ({ one }) => ({
  item: one(items, {
    fields: [prices.item],
    references: [items.id],
  }),
  priceGroup: one(priceGroups, {
    fields: [prices.priceGroup],
    references: [priceGroups.id],
  }),
}))

export const itemsRelations = relations(items, ({ many }) => ({
  prices: many(prices),
}))

export const priceGroupsRelations = relations(priceGroups, ({ many }) => ({
  prices: many(prices),
}))

export const transactionItemsRelations = relations(
  transactionItems,
  ({ one }) => ({
    transaction: one(transactions, {
      fields: [transactionItems.transaction],
      references: [transactions.id],
    }),
  })
)

export const transactionsRelations = relations(transactions, ({ many }) => ({
  transactionItems: many(transactionItems),
}))
