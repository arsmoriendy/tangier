import { BackupForm } from "@/app/(authorized)/(admin)/backup-restore/backup-form"
import { RestoreForm } from "@/app/(authorized)/(admin)/backup-restore/restore-form"
import PageHeader, { PageTitle } from "@/components/page-header"
import { FieldLegend, FieldSet } from "@/components/ui/field"
import { ClockCounterClockwiseIcon } from "@phosphor-icons/react/ssr"
import { getTranslations } from "next-intl/server"

export default async function Page() {
  const t = await getTranslations("backupRestore")

  return (
    <>
      <PageHeader>
        <ClockCounterClockwiseIcon />
        <PageTitle>{t("title")}</PageTitle>
      </PageHeader>
      <div className="max-w-sm px-2 pt-2">
        <FieldSet>
          <FieldLegend>{t("backup.legend")}</FieldLegend>
          <BackupForm />
        </FieldSet>
        <FieldSet>
          <FieldLegend>{t("restore.legend")}</FieldLegend>
          <RestoreForm />
        </FieldSet>
      </div>
    </>
  )
}
