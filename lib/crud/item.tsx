"use server"

import { db } from "@/lib/db"
import { items, prices as pricesTable } from "@/lib/db/schema"
import { ilike } from "drizzle-orm"

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

export async function listItem({ name }: { name: string }) {
  return await db.query.items.findMany({
    where: ilike(items.name, `%${name}%`),
    with: {
      prices: {
        columns: { price: true, createdAt: true },
        with: { priceGroup: true },
      },
    },
  })
}

export type ItemWithRelations = Awaited<ReturnType<typeof listItem>>[number]
