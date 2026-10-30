"use server"

import { db } from "@/lib/db"
import { userSettings } from "@/lib/db/schema"
import { getTableConfig } from "drizzle-orm/pg-core"

export type UserSettings = Omit<typeof userSettings.$inferSelect, "userId">

export async function getUserSettings({
  userId,
}: {
  userId: string
}): Promise<UserSettings> {
  const settings = await db.query.userSettings.findFirst({
    columns: { userId: false },
    where: (settings, { eq }) => eq(settings.userId, userId),
  })

  if (settings) return settings

  const { columns } = getTableConfig(userSettings)
  const defaultSetings = Object.fromEntries(
    columns.filter((c) => c.hasDefault).map((c) => [c.name, c.default])
  ) as UserSettings

  return defaultSetings
}
