"use server"

import { db } from "@/lib/db"
import { priceGroups } from "@/lib/db/schema"

export async function createPriceGroup(
  priceGroup: typeof priceGroups.$inferInsert
) {
  await db.insert(priceGroups).values(priceGroup)
}

export async function listPriceGroups() {
  return await db.select().from(priceGroups)
}
