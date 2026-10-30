import { db } from "@/lib/db"
import { migrate } from "drizzle-orm/node-postgres/migrator"

export async function register() {
  await import("@/lib/env")
  await migrate(db, {
    migrationsFolder: "drizzle",
  })
}
