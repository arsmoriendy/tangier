"use client"

import { Button } from "@/components/ui/button"
import { ArrowsClockwiseIcon } from "@phosphor-icons/react"
import { redirect } from "next/navigation"

export function RefreshButton() {
  return (
    <Button
      onClick={() => {
        redirect("/")
      }}
    >
      <ArrowsClockwiseIcon /> Refresh
    </Button>
  )
}
