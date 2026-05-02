"use server"

import { db } from "@/lib/db"

export async function listBarcodeGroups(
  args: Parameters<typeof db.query.barcodeGroups.findMany>[0] = {}
) {
  return await db.query.barcodeGroups.findMany(args)
}
