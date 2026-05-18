"use client"

import { FieldLegend } from "@/components/ui/field"
import { useTranslations } from "next-intl"

export function Legend() {
  const t = useTranslations("users")
  return <FieldLegend>{t("title")}</FieldLegend>
}
