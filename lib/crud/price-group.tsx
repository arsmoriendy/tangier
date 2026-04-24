"use server"

import { db } from "@/lib/db"
import { priceGroups } from "@/lib/db/schema"

export async function createPriceGroup(priceGroupDto: { name: string }) {
  const priceGroup: typeof priceGroups.$inferInsert = { ...priceGroupDto }
  await db.insert(priceGroups).values(priceGroup)
}

export async function listPriceGroups() {
  return await db.select().from(priceGroups)
}
