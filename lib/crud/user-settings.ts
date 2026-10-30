"use server"

import { db } from "@/lib/db"
import { userSettings } from "@/lib/db/schema"
import { defaultUserSetings } from "@/lib/default-user-settings"

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

  return settings ?? defaultUserSetings
}

export async function upsertUserSettings(
  args: typeof userSettings.$inferInsert
) {
  const { userId: _, ...updatedSettings } = args

  await db.insert(userSettings).values(args).onConflictDoUpdate({
    target: userSettings.userId,
    set: updatedSettings,
  })
}
