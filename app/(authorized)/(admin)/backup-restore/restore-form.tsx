"use client"

import { Spinner } from "@/components/spinner"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ClockCounterClockwiseIcon } from "@phosphor-icons/react/dist/ssr"
import { useTranslations } from "next-intl"
import { SyntheticEvent, useState } from "react"
import { toast } from "sonner"

export function RestoreForm() {
  const [loading, setLoading] = useState(false)
  const t = useTranslations("backupRestore")

  async function handleRestore(e: SyntheticEvent<HTMLFormElement>) {
    e.preventDefault()

    setLoading(true)

    const file = new FormData(e.currentTarget).get("dump")
    if (!(file instanceof File) || file.size === 0) return

    const { status } = await fetch("/api/restore", {
      method: "POST",
      body: file,
    })

    setLoading(false)

    if (status !== 200) {
      toast.error(t("restore.error"))
    } else {
      toast.success(t("restore.success"))
    }
  }

  return (
    <form onSubmit={handleRestore} method="POST" className="space-y-2">
      <Input type="file" name="dump" required />
      <Button type="submit" disabled={loading}>
        {loading ? <Spinner /> : <ClockCounterClockwiseIcon />}
        {t("restore.buttonLabel")}
      </Button>
    </form>
  )
}
