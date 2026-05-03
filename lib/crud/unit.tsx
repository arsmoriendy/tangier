"use server"

import { db } from "@/lib/db"
import { units } from "@/lib/db/schema"
import { asc, eq } from "drizzle-orm"

export async function listUnits() {
  return await db.query.units.findMany({ orderBy: [asc(units.id)] })
}

export async function createUnit(data: typeof units.$inferInsert) {
  return await db
    .insert(units)
    .values(data)
    .returning({ id: units.id, name: units.name })
}

export async function updateUnit(data: typeof units.$inferSelect) {
  await db.update(units).set(data).where(eq(units.id, data.id))
}

export async function deleteUnit(id: string) {
  await db.delete(units).where(eq(units.id, id))
}
