import { relations } from "drizzle-orm/relations"
import {
  units,
  items,
  barcodes,
  barcodeGroups,
  prices,
  priceGroups,
  transactions,
  transactionItems,
} from "./schema"

export const itemsRelations = relations(items, ({ one, many }) => ({
  unit: one(units, {
    fields: [items.unit],
    references: [units.id],
  }),
  barcodes: many(barcodes),
  prices: many(prices),
}))

export const unitsRelations = relations(units, ({ many }) => ({
  items: many(items),
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
