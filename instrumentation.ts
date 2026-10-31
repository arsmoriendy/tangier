import { migrateDb } from "@/lib/db/migrate-db"

export async function register() {
  await import("@/lib/env")
  await migrateDb()
}
