"use server"

import { db } from "@/lib/db"
import { items, prices as pricesTable } from "@/lib/db/schema"
import { count, ilike } from "drizzle-orm"

export async function countItems() {
  return (await db.select({ count: count() }).from(items))[0].count
}

export async function createItem({
  name,
  prices = [],
}: {
  name: string
  prices?: { priceGroup: string; price: number }[]
}) {
  await db.transaction(async (tx) => {
    const { id: item } = (
      await tx.insert(items).values({ name }).returning({ id: items.id })
    )[0]

    for (const { price, priceGroup } of prices) {
      await tx.insert(pricesTable).values({ item, price, priceGroup })
    }
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
