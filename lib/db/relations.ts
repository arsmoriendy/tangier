import { relations } from "drizzle-orm/relations"
import {
  units,
  items,
  barcodes,
  barcodeGroups,
  sellPrices,
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
  sellPrices: many(sellPrices),
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

export const sellPricesRelations = relations(sellPrices, ({ one }) => ({
  item: one(items, {
    fields: [sellPrices.item],
    references: [items.id],
  }),
  priceGroup: one(priceGroups, {
    fields: [sellPrices.priceGroup],
    references: [priceGroups.id],
  }),
}))

export const priceGroupsRelations = relations(priceGroups, ({ many }) => ({
  sellPrices: many(sellPrices),
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

