"use client"

import { Button } from "@/components/ui/button"
import { ArrowsClockwiseIcon } from "@phosphor-icons/react"
import { useTranslations } from "next-intl"
import { redirect } from "next/navigation"

export function RefreshButton() {
  const t = useTranslations("auth.inactive")

  return (
    <Button
      onClick={() => {
        redirect("/")
      }}
    >
      <ArrowsClockwiseIcon /> {t("refresh")}
    </Button>
  )
}
