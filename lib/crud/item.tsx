"use server"

import { db } from "@/lib/db"
import {
  items,
  prices as pricesTable,
  barcodes as barcodesTable,
} from "@/lib/db/schema"
import { count, ilike } from "drizzle-orm"

export async function countItems() {
  return (await db.select({ count: count() }).from(items))[0].count
}

export async function createItem({
  name,
  prices = [],
  barcodes = [],
}: {
  name: string
  prices?: { priceGroup: string; price: number }[]
  barcodes?: { barcodeGroup: string; barcode: string }[]
}) {
  await db.transaction(async (tx) => {
    const { id: item } = (
      await tx.insert(items).values({ name }).returning({ id: items.id })
    )[0]

    await tx
      .insert(pricesTable)
      .values(
        prices
          .filter((p) => p.price > 0)
          .map(({ price, priceGroup }) => ({ item, price, priceGroup }))
      )

    await tx.insert(barcodesTable).values(
      barcodes
        .filter((b) => b.barcode.length > 0)
        .map(({ barcode, barcodeGroup }) => ({
          item,
          barcode,
          barcodeGroup,
        }))
    )
  })
}

export async function listItems({
  name = "",
  limit = 10,
  offset = 0,
}: {
  name?: string
  limit?: number
  offset?: number
} = {}) {
  return await db.query.items.findMany({
    where: ilike(items.name, `%${name}%`),
    limit,
    offset,
    with: {
      barcodes: {
        columns: { barcode: true },
        with: { barcodeGroup: true },
      },
      prices: {
        columns: { price: true },
        with: { priceGroup: true },
      },
    },
  })
}

export type ItemWithRelations = Awaited<ReturnType<typeof listItems>>[number]
