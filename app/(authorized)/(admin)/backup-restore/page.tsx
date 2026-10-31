import { BackupForm } from "@/app/(authorized)/(admin)/backup-restore/backup-form"
import { RestoreForm } from "@/app/(authorized)/(admin)/backup-restore/restore-form"
import PageHeader, { PageTitle } from "@/components/page-header"
import { FieldLegend, FieldSet } from "@/components/ui/field"
import { ClockCounterClockwiseIcon } from "@phosphor-icons/react/ssr"

export default async function Page() {
  return (
    <>
      <PageHeader>
        <ClockCounterClockwiseIcon />
        <PageTitle>Backup / Restore</PageTitle>
      </PageHeader>
      <div className="max-w-sm px-2 pt-2">
        <FieldSet>
          <FieldLegend>Backup</FieldLegend>
          <BackupForm />
        </FieldSet>
        <FieldSet>
          <FieldLegend>Restore</FieldLegend>
          <RestoreForm />
        </FieldSet>
      </div>
    </>
  )
}
