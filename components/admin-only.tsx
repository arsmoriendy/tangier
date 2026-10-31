"use client"

import { useSession } from "@/contexts/session-ctx"
import { ReactNode } from "react"

export default function AdminOnly(props: { children: ReactNode }) {
  const { user } = useSession()
  if (user.role !== "admin") return null
  return props.children
}
