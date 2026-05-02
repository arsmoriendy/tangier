"use server"

import { db } from "@/lib/db"
import { barcodeGroups } from "@/lib/db/schema"
import { asc, eq } from "drizzle-orm"

export async function createBarcodeGroup(
  barcodeGroup: typeof barcodeGroups.$inferInsert
) {
  await db.insert(barcodeGroups).values(barcodeGroup)
}

export async function updateBarcodeGroup({
  id,
  ...barcodeGroup
}: typeof barcodeGroups.$inferInsert & { id: string }) {
  await db
    .update(barcodeGroups)
    .set(barcodeGroup)
    .where(eq(barcodeGroups.id, id))
}

export async function deleteBarcodeGroup(id: string) {
  await db.delete(barcodeGroups).where(eq(barcodeGroups.id, id))
}

export async function listBarcodeGroups(
  args: Parameters<typeof db.query.barcodeGroups.findMany>[0] = {
    orderBy: [asc(barcodeGroups.name)],
  }
) {
  return await db.query.barcodeGroups.findMany(args)
}
