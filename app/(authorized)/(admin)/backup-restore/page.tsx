import { BackupForm } from "@/app/(authorized)/(admin)/backup-restore/backup-form"
import { RestoreForm } from "@/app/(authorized)/(admin)/backup-restore/restore-form"
import { FieldLegend, FieldSet } from "@/components/ui/field"

export default async function Page() {
  return (
    <div className="max-w-sm">
      <FieldSet>
        <FieldLegend>Backup</FieldLegend>
        <BackupForm />
      </FieldSet>
      <FieldSet>
        <FieldLegend>Restore</FieldLegend>
        <RestoreForm />
      </FieldSet>
    </div>
  )
}
