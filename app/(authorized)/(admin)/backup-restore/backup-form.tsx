import { Button } from "@/components/ui/button"
import { DownloadIcon } from "@phosphor-icons/react/dist/ssr"

export function BackupForm() {
  return (
    <form action="/api/backup" method="GET">
      <Button type="submit">
        <DownloadIcon />
        Download backup
      </Button>
    </form>
  )
}
