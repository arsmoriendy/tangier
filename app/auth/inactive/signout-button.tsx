"use client"

import { Button } from "@/components/ui/button"
import { authClient } from "@/lib/auth-client"
import { SignOutIcon } from "@phosphor-icons/react"
import { useTranslations } from "next-intl"
import { redirect } from "next/navigation"

export function SignoutButton() {
  const t = useTranslations("sidebar.account")

  return (
    <Button
      variant="destructive"
      onClick={async () => {
        await authClient.signOut()
        redirect("/auth")
      }}
    >
      <SignOutIcon />
      {t("signOut")}
    </Button>
  )
}
