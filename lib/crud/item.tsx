"use server"

import { db } from "@/lib/db"
import { items, prices as pricesTable } from "@/lib/db/schema"

export async function createItem({
  name,
  stock,
  prices = [],
}: {
  name: string
  stock: number
  prices?: { priceGroup: string; price: number }[]
}) {
  await db.transaction(async (tx) => {
    const { id: item } = (
      await tx.insert(items).values({ name, stock }).returning({ id: items.id })
    )[0]

    for (const { price, priceGroup } of prices) {
      await tx.insert(pricesTable).values({ item, price, priceGroup })
    }
  })
}
