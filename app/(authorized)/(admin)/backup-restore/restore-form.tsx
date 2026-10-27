"use client"

import { Spinner } from "@/components/spinner"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { ClockCounterClockwiseIcon } from "@phosphor-icons/react/dist/ssr"
import { useTranslations } from "next-intl"
import { SyntheticEvent, useState } from "react"
import { toast } from "sonner"

export function RestoreForm() {
  const [loading, setLoading] = useState(false)
  const t = useTranslations("backupRestore.restore")

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
      toast.error(t("error"))
    } else {
      toast.success(t("success"))
    }
  }

  return (
    <form onSubmit={handleRestore} method="POST" className="space-y-2">
      <Label htmlFor="dump">{t("fileInputLabel")}:</Label>
      <Input type="file" name="dump" id="dump" required />
      <Button type="submit" disabled={loading}>
        {loading ? <Spinner /> : <ClockCounterClockwiseIcon />}
        {t("buttonLabel")}
      </Button>
    </form>
  )
}
