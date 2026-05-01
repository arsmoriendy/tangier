"use server"

import { db } from "@/lib/db"
import { prices } from "@/lib/db/schema"
import { eq } from "drizzle-orm"

export async function listPrices(item: string) {
  return await db.select().from(prices).where(eq(prices.item, item))
}
