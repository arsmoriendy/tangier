"use server"

import { db } from "@/lib/db"
import { buyPrices } from "@/lib/db/schema"
import { eq, sql } from "drizzle-orm"

export async function updateBuyPriceStock({
  id,
  stockDelta,
}: {
  id: string
  stockDelta: number
}) {
  await db
    .update(buyPrices)
    .set({ stock: sql`${buyPrices.stock} + ${stockDelta}` })
    .where(eq(buyPrices.id, id))
}
