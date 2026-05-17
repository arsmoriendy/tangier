"use client"

import { Button } from "@/components/ui/button"
import { authClient } from "@/lib/auth-client"
import { SignOutIcon } from "@phosphor-icons/react"
import { redirect } from "next/navigation"

export function SignoutButton() {
  return (
    <Button
      variant="destructive"
      onClick={async () => {
        await authClient.signOut()
        redirect("/auth")
      }}
    >
      <SignOutIcon />
      Sign out
    </Button>
  )
}
