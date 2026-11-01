"use client"

import { FieldLegend, FieldSet } from "@/components/ui/field"
import AdminOnly from "@/components/admin-only"
import { useUserSettings } from "@/contexts/user-settings"
import { useTranslations } from "next-intl"
import { Report } from "./report"

export function ReportFieldSet() {
  const { getUserSettings } = useUserSettings()
  const t = useTranslations("transactions.history")

  return (
    <AdminOnly>
      {!getUserSettings.hideHistoryReports && (
        <FieldSet className="flex-1">
          <FieldLegend>{t("report.legend")}</FieldLegend>
          <Report />
        </FieldSet>
      )}
    </AdminOnly>
  )
}
