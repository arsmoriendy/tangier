"use server"

import { redirect } from "next/navigation"
import { getSession } from "./get-session"

export async function authGuard() {
  const session = await getSession()

  if (!session) redirect("/auth")
  if (!session.user.active) redirect("/auth/inactive")

  return session
}
