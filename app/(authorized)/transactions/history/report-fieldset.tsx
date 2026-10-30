"use client"

import { FieldLegend, FieldSet } from "@/components/ui/field"
import { useUserSettings } from "@/contexts/user-settings"
import { useTranslations } from "next-intl"
import { Report } from "./report"
import { useSession } from "@/contexts/session-ctx"

export function ReportFieldSet() {
  const { getUserSettings } = useUserSettings()
  const t = useTranslations("transactions.history")
  const sess = useSession()

  if (sess.user.role !== "admin" || getUserSettings.hideHistoryReports)
    return null

  return (
    <FieldSet className="flex-1">
      <FieldLegend>{t("report.legend")}</FieldLegend>
      <Report />
    </FieldSet>
  )
}
