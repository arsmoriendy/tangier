import { env } from "@/lib/env"
import * as schema from "@/lib/db/schema"
import * as relations from "@/lib/db/relations"
import { drizzle } from "drizzle-orm/node-postgres"

export const db = drizzle(env.DATABASE_URL, {
  schema: { ...schema, ...relations },
})
