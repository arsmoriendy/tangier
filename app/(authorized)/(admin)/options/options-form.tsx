"use client"

import { Field, FieldLabel, FieldSet, FieldLegend } from "@/components/ui/field"
import { Checkbox } from "@/components/ui/checkbox"
import { useLocalStorage } from "@/contexts/local-storage-ctx"
import { useTranslations } from "next-intl"

function OptionCheckbox({
  checked,
  onCheckedChange,
  label,
}: {
  checked: boolean
  onCheckedChange: (c: boolean) => void
  label: string
}) {
  return (
    <Field orientation="horizontal">
      <Checkbox checked={checked} onCheckedChange={onCheckedChange} />
      <FieldLabel>{label}</FieldLabel>
    </Field>
  )
}

export default function OptionsForm() {
  const t = useTranslations("options")
  const { setLocalStorage, getLocalStorage } = useLocalStorage()

  return (
    <FieldSet>
      <FieldLegend>{t("title")}</FieldLegend>

      <FieldSet>
        <FieldLegend variant="legend">{t("financialInfo")}</FieldLegend>

        <FieldSet>
          <FieldLegend variant="label">{t("transactionForm")}</FieldLegend>
          <OptionCheckbox
            checked={getLocalStorage.hideTrxMarginAndDiscounts}
            onCheckedChange={(c) =>
              (setLocalStorage.hideTrxMarginAndDiscounts = c)
            }
            label={t("hideTrxMarginAndDiscounts")}
          />
          <OptionCheckbox
            checked={getLocalStorage.hideTrxBuyPrice}
            onCheckedChange={(c) => (setLocalStorage.hideTrxBuyPrice = c)}
            label={t("hideTrxBuyPrice")}
          />
        </FieldSet>

        <FieldSet>
          <FieldLegend variant="label">{t("historyPage")}</FieldLegend>
          <OptionCheckbox
            checked={getLocalStorage.hideHistoryReports}
            onCheckedChange={(c) => (setLocalStorage.hideHistoryReports = c)}
            label={t("hideHistoryReports")}
          />
        </FieldSet>

        <FieldSet>
          <FieldLegend variant="label">{t("itemPage")}</FieldLegend>
          <OptionCheckbox
            checked={getLocalStorage.hideItemMarginAndDiscounts}
            onCheckedChange={(c) =>
              (setLocalStorage.hideItemMarginAndDiscounts = c)
            }
            label={t("hideItemMarginAndDiscounts")}
          />
        </FieldSet>
      </FieldSet>
    </FieldSet>
  )
}
