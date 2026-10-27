"use client"

import { Button } from "@/components/ui/button"
import { download } from "@tauri-apps/plugin-upload"
import { DownloadIcon } from "@phosphor-icons/react/dist/ssr"
import { isTauri } from "@tauri-apps/api/core"
import { useTranslations } from "next-intl"
import { save } from "@tauri-apps/plugin-dialog"
import { generateBackupFilepath } from "@/lib/generate-backup-filepath"
import { useState } from "react"
import { authClient } from "@/lib/auth-client"
import { toast } from "sonner"
import { env } from "@/lib/env"
import { Progress } from "@/components/ui/progress"
import { Spinner } from "@/components/spinner"

export function BackupForm() {
  return isTauri() ? <TauriForm /> : <WebForm />
}

function WebForm() {
  const t = useTranslations("backupRestore.backup")
  return (
    <form action="/api/backup" method="GET">
      <Button type="submit">
        <DownloadIcon />
        {t("buttonLabel")}
      </Button>
    </form>
  )
}

function TauriForm() {
  const t = useTranslations("backupRestore.backup")
  const [progress, setProgress] = useState(0)

  async function handleBackup() {
    const savePath = await save({
      title: t("buttonLabel"),
      defaultPath: generateBackupFilepath(),
    })

    if (savePath === null) return

    const tokenRes = await authClient.token()
    if (tokenRes.error) {
      toast.error("Authentication error")
      console.error(tokenRes.error)
      return
    }

    setProgress(0)
    let downloaded = 0
    await download(
      `${window.location.origin}/api/backup`,
      savePath,
      ({ progress, total }) => {
        downloaded += progress
        setProgress(downloaded / total)
      },
      new Map([["Authorization", `Bearer ${tokenRes.data.token}`]])
    )

    toast.success(t("success"))
  }

  return (
    <>
      <Button onClick={handleBackup}>
        {progress !== 0 && progress !== 1 ? <Spinner /> : <DownloadIcon />}
        {t("buttonLabel")}
      </Button>
      <Progress value={progress * 100} />
    </>
  )
}
