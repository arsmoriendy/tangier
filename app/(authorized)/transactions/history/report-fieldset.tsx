"use client"

import { FieldLegend, FieldSet } from "@/components/ui/field"
import AdminOnly from "@/components/admin-only"
import { useUserSettings } from "@/contexts/user-settings"
import { useTranslations } from "next-intl"
import dynamic from "next/dynamic"

// recharts is heavy and the report is opt-in (admin setting), so keep it out of
// the history page's initial bundle.
const Report = dynamic(() => import("./report").then((m) => m.Report), {
  ssr: false,
})

export function ReportFieldSet() {
  const { getUserSettings } = useUserSettings()
  const t = useTranslations("transactions.history")

  return (
    <AdminOnly>
      {getUserSettings.showHistoryReports && (
        <FieldSet className="flex-1">
          <FieldLegend>{t("report.legend")}</FieldLegend>
          <Report />
        </FieldSet>
      )}
    </AdminOnly>
  )
}
