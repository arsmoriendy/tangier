"use client"

import { useSession } from "@/contexts/session-ctx"
import { ReactNode } from "react"

export function useIsAdmin() {
  const { user } = useSession()
  return user.role === "admin"
}

export default function AdminOnly(props: { children: ReactNode }) {
  const isAdmin = useIsAdmin()
  if (!isAdmin) return null
  return props.children
}
