"use client"

import { Field, FieldLabel, FieldSet, FieldLegend } from "@/components/ui/field"
import { Checkbox } from "@/components/ui/checkbox"
import { useLocalStorage } from "@/contexts/local-storage-ctx"
import { useTranslations } from "next-intl"
import { useSession } from "@/contexts/session-ctx"

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
    <Field orientation="horizontal" className="gap-2">
      <Checkbox checked={checked} onCheckedChange={onCheckedChange} />
      <FieldLabel>{label}</FieldLabel>
    </Field>
  )
}

export default function OptionsForm() {
  const t = useTranslations("options")
  const { user } = useSession()
  const { setLocalStorage, getLocalStorage } = useLocalStorage()

  return (
    <FieldSet>
      <FieldLegend>{t("title")}</FieldLegend>

      {user.role === "admin" && (
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
            <OptionCheckbox
              checked={getLocalStorage.coloredSellPrice}
              onCheckedChange={(c) => (setLocalStorage.coloredSellPrice = c)}
              label={t("coloredSellPrice")}
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
      )}

      <FieldSet>
        <FieldLegend variant="label">{t("miscellaneous")}</FieldLegend>
        <OptionCheckbox
          checked={getLocalStorage.uppercaseInput}
          onCheckedChange={(c) => (setLocalStorage.uppercaseInput = c)}
          label={t("uppercaseInput")}
        />
      </FieldSet>
    </FieldSet>
  )
}
