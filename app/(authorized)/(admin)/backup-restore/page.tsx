import { RestoreForm } from "@/app/(authorized)/(admin)/backup-restore/restore-form"
import { Button } from "@/components/ui/button"
import { ClockCounterClockwiseIcon } from "@phosphor-icons/react/dist/ssr"

export default async function Page() {
  return (
    <>
      <form action="/api/backup" method="GET">
        <Button type="submit">
          <ClockCounterClockwiseIcon />
          Backup
        </Button>
      </form>

      <RestoreForm />
    </>
  )
}
