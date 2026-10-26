"use client"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ClockCounterClockwiseIcon } from "@phosphor-icons/react/dist/ssr"
import { SyntheticEvent } from "react"

async function handleRestore(e: SyntheticEvent<HTMLFormElement>) {
  e.preventDefault()

  const file = new FormData(e.currentTarget).get("dump")
  if (!(file instanceof File) || file.size === 0) return

  await fetch("/api/restore", {
    method: "POST",
    body: file,
  })
}

export function RestoreForm() {
  return (
    <form onSubmit={handleRestore} method="POST" className="space-y-2">
      <Input type="file" name="dump" />
      <Button>
        <ClockCounterClockwiseIcon />
        Restore from file
      </Button>
    </form>
  )
}
