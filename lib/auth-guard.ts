"use server"

import { redirect } from "next/navigation"
import { getSession } from "./get-session"

export async function authGuard() {
  const session = await getSession()

  if (!session) redirect("/auth")
  if (!session.user.active) redirect("/auth/inactive")

  return session
}

export async function withAuth({ admin }: { admin?: true }) {
  const session = await getSession()
  if (!session || (admin && session.user.role !== "admin"))
    return Response.json({ error: "Unauthorized" }, { status: 401 })
}
