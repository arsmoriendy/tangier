"use server"

import { db } from "@/lib/db"
import { sellPrices } from "@/lib/db/schema"
import { eq } from "drizzle-orm"

export async function listPrices(item: string) {
  return await db.select().from(sellPrices).where(eq(sellPrices.item, item))
}
