"use server"

import { db } from "@/lib/db"
import { user } from "@/lib/db/auth-schema"
import { count } from "drizzle-orm"

export async function countUser() {
  return (await db.select({ count: count() }).from(user))[0].count
}
