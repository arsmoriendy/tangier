"use server"

import { db } from "@/lib/db"
import { user } from "@/lib/db/auth-schema"
import { count } from "drizzle-orm"

export async function countUser() {
  return (await db.select({ count: count() }).from(user))[0].count
}

export async function readUser(
  args: Parameters<typeof db.query.user.findFirst>[0]
) {
  return await db.query.user.findFirst(args)
}

export async function listUsers(
  args: Parameters<typeof db.query.user.findMany>[0]
) {
  return await db.query.user.findMany(args)
}
