import { Button } from "@/components/ui/button"
import { DownloadIcon } from "@phosphor-icons/react/dist/ssr"
import { useTranslations } from "next-intl"

export function BackupForm() {
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
