import type { UserSettings } from "@/lib/crud/user-settings"
import { userSettings } from "@/lib/db/schema"
import { getTableConfig } from "drizzle-orm/pg-core"

const { columns } = getTableConfig(userSettings)

export const defaultUserSetings = Object.fromEntries(
  columns.filter((c) => c.hasDefault).map((c) => [c.name, c.default])
) as UserSettings
