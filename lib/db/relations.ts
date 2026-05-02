import { relations } from "drizzle-orm/relations"
import {
  items,
  prices,
  priceGroups,
  barcodes,
  barcodeGroups,
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
  barcodes: many(barcodes),
}))

export const priceGroupsRelations = relations(priceGroups, ({ many }) => ({
  prices: many(prices),
}))

export const barcodesRelations = relations(barcodes, ({ one }) => ({
  item: one(items, {
    fields: [barcodes.item],
    references: [items.id],
  }),
  barcodeGroup: one(barcodeGroups, {
    fields: [barcodes.barcodeGroup],
    references: [barcodeGroups.id],
  }),
}))

export const barcodeGroupsRelations = relations(barcodeGroups, ({ many }) => ({
  barcodes: many(barcodes),
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
