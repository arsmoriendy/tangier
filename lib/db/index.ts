import { env } from "@/lib/env"
import * as schema from "@/lib/db/schema"
import * as relations from "@/lib/db/relations"
import * as authSchema from "@/lib/db/auth-schema"
import { drizzle } from "drizzle-orm/node-postgres"
import { migrate } from "drizzle-orm/node-postgres/migrator"

export const db = drizzle(env.DATABASE_URL, {
  schema: { ...schema, ...relations, ...authSchema },
})
