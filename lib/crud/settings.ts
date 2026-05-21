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
  const exists =
    (await db.select().from(settings).where(eq(settings.id, 1))).length > 0

  if (exists) {
    await db.update(settings).set(newSettings).where(eq(settings.id, 1))
  } else {
    await db.insert(settings).values({
      id: 1,
      ...newSettings,
    })
  }
}
