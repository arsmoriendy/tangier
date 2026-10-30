"use server"

import { redirect } from "next/navigation"
import { getSession } from "./get-session"

async function session({ admin = false }: { admin?: boolean } = {}) {
  const session = await getSession()
  return !session || (admin && session.user.role !== "admin") ? null : session
}

type SessionParams = Parameters<typeof session>

export async function getSessionOrRedirect(...sessParams: SessionParams) {
  const sess = await session(...sessParams)

  if (!sess) redirect("/auth")
  if (!sess.user.active) redirect("/auth/inactive")

  return sess
}

export async function isUnauthorized(...sessParams: SessionParams) {
  const sess = await session(...sessParams)

  if (!sess) return Response.json({ error: "Unauthorized" }, { status: 401 })
}
