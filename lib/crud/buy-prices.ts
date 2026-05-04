"use server"

import { db } from "@/lib/db"
import { buyPrices } from "@/lib/db/schema"
import { and, eq, sql } from "drizzle-orm"

export async function updateBuyPriceStock({
  itemId,
  price,
  stockDelta,
}: {
  itemId: string
  price: number
  stockDelta: number
}) {
  await db
    .update(buyPrices)
    .set({ stock: sql`${buyPrices.stock} + ${stockDelta}` })
    .where(and(eq(buyPrices.item, itemId), eq(buyPrices.price, price)))
}
