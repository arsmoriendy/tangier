"use server"

import { db } from "@/lib/db"
import { priceGroups } from "@/lib/db/schema"
import { asc, eq } from "drizzle-orm"

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

export async function listPriceGroups(
  args: Parameters<typeof db.query.priceGroups.findMany>[0] = {
    orderBy: [asc(priceGroups.quantityThreshold), asc(priceGroups.name)],
  }
) {
  return await db.query.priceGroups.findMany(args)
}

export async function deletePriceGroup(id: string) {
  await db.delete(priceGroups).where(eq(priceGroups.id, id))
}
