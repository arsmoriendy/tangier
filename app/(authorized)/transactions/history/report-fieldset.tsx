"use client"

import { FieldLegend, FieldSet } from "@/components/ui/field"
import { useLocalStorage } from "@/contexts/local-storage-ctx"
import { useTranslations } from "next-intl"
import { Report } from "./report"
import { useSession } from "@/contexts/session-ctx"

export function ReportFieldSet() {
  const { getLocalStorage } = useLocalStorage()
  const t = useTranslations("transactions.history")
  const sess = useSession()

  if (sess.user.role !== "admin" || getLocalStorage.hideHistoryReports)
    return null

  return (
    <FieldSet className="flex-1">
      <FieldLegend>{t("report.legend")}</FieldLegend>
      <Report />
    </FieldSet>
  )
}
