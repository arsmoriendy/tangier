"use server"

import { db } from "@/lib/db"
import { items } from "@/lib/db/schema"

export async function createItem(itemDto: { name: string; stock: number }) {
  const item: typeof items.$inferInsert = { ...itemDto }
  await db.insert(items).values(item)
}
