"use server"

import { db } from "@/lib/db"
import { priceGroups } from "@/lib/db/schema"
import { eq } from "drizzle-orm"

export async function createPriceGroup(
  priceGroup: typeof priceGroups.$inferInsert
) {
  await db.insert(priceGroups).values(priceGroup)
}

export async function updatePriceGroup({
  id,
  ...priceGroup
}: typeof priceGroups.$inferInsert & { id: string }) {
  await db.update(priceGroups).set(priceGroup).where(eq(priceGroups.id, id))
}

export async function listPriceGroups() {
  return await db.select().from(priceGroups)
}
