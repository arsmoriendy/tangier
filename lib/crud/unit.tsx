"use server"

import { db } from "@/lib/db"

export async function listUnits() {
  return await db.query.units.findMany()
}
