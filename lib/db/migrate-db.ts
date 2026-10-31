import { db } from "@/lib/db"
import { migrate } from "drizzle-orm/node-postgres/migrator"

export async function migrateDb() {
  await migrate(db, {
    migrationsFolder: "drizzle",
  })
}
