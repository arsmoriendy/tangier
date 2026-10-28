"use client"

import { Button } from "@/components/ui/button"
import { download } from "@tauri-apps/plugin-upload"
import { DownloadIcon } from "@phosphor-icons/react/dist/ssr"
import { isTauri } from "@tauri-apps/api/core"
import { useTranslations } from "next-intl"
import { save } from "@tauri-apps/plugin-dialog"
import { generateBackupFilename } from "@/lib/generate-backup-filename"
import { useState } from "react"
import { authClient } from "@/lib/auth-client"
import { toast } from "sonner"
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

enum DownloadStatus {
  Initial, // not started / finished
  Started,
}

function TauriForm() {
  const t = useTranslations("backupRestore.backup")
  const [progress, setProgress] = useState(0)
  const [status, setStatus] = useState(DownloadStatus.Initial)

  async function handleBackup() {
    const savePath = await save({
      title: t("buttonLabel"),
      defaultPath: generateBackupFilename(),
    })

    if (savePath === null) return

    const tokenRes = await authClient.token()
    if (tokenRes.error) {
      toast.error("Authentication error")
      console.error(tokenRes.error)
      return
    }

    setProgress(0)
    setStatus(DownloadStatus.Started)

    await download(
      `${window.location.origin}/api/backup`,
      savePath,
      ({ progressTotal, total }) => {
        const perc = (progressTotal / total) * 100
        if (perc >= 100) setStatus(DownloadStatus.Initial)
        setProgress(perc)
      },
      new Map([["Authorization", `Bearer ${tokenRes.data.token}`]])
    )

    toast.success(t("success"))
  }

  return (
    <Button
      className="relative"
      onClick={handleBackup}
      disabled={status === DownloadStatus.Started}
    >
      {status === DownloadStatus.Started ? <Spinner /> : <DownloadIcon />}
      {t("buttonLabel")}
      {status === DownloadStatus.Started && (
        <Progress
          className="absolute bottom-0"
          indicatorClass="bg-success"
          value={progress}
        />
      )}
    </Button>
  )
}
