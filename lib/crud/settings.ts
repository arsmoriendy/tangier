"use server"

import { db } from "@/lib/db"
import { settings } from "@/lib/db/schema"
import { eq } from "drizzle-orm"

export type Settings = {
  receiptHeader?: string | null
  receiptFooter?: string | null
}

export async function listSettings(): Promise<Settings> {
  const result = await db.select().from(settings).where(eq(settings.id, 1))
  if (result.length === 0) {
    return { receiptHeader: null, receiptFooter: null }
  }
  return {
    receiptHeader: result[0].receiptHeader,
    receiptFooter: result[0].receiptFooter,
  }
}

export async function updateSettings(newSettings: Partial<Settings>) {
  if (Object.keys(newSettings).length === 0) return

  await db
    .insert(settings)
    .values({ id: 1, ...newSettings })
    .onConflictDoUpdate({ target: settings.id, set: newSettings })
}
