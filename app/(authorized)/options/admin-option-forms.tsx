"use client"

import OptionCheckbox from "@/app/(authorized)/options/option-checkbox"
import { FieldLegend, FieldSet } from "@/components/ui/field"
import { useSession } from "@/contexts/session-ctx"
import { useUserSettings } from "@/contexts/user-settings"
import { useTranslations } from "next-intl"

export default function AdminOptionForms() {
  const { setUserSettings, getUserSettings } = useUserSettings()
  const { user } = useSession()
  const t = useTranslations("options")
  const ts = useTranslations("userSettings")

  if (user.role !== "admin") return null

  return (
    <>
      <FieldSet>
        <FieldLegend variant="label">{t("transactionForm")}</FieldLegend>
        <OptionCheckbox
          checked={getUserSettings.hideTrxMarginAndDiscounts}
          onCheckedChange={(c) =>
            (setUserSettings.hideTrxMarginAndDiscounts = c)
          }
          label={ts("hideTrxMarginAndDiscounts")}
        />
        <OptionCheckbox
          checked={getUserSettings.hideTrxBuyPrice}
          onCheckedChange={(c) => (setUserSettings.hideTrxBuyPrice = c)}
          label={ts("hideTrxBuyPrice")}
        />
        <OptionCheckbox
          checked={getUserSettings.coloredSellPrice}
          onCheckedChange={(c) => (setUserSettings.coloredSellPrice = c)}
          label={ts("coloredSellPrice")}
        />
      </FieldSet>

      <FieldSet>
        <FieldLegend variant="label">{t("historyPage")}</FieldLegend>
        <OptionCheckbox
          checked={getUserSettings.hideHistoryReports}
          onCheckedChange={(c) => (setUserSettings.hideHistoryReports = c)}
          label={ts("hideHistoryReports")}
        />
      </FieldSet>

      <FieldSet>
        <FieldLegend variant="label">{t("itemPage")}</FieldLegend>
        <OptionCheckbox
          checked={getUserSettings.hideItemMarginAndDiscounts}
          onCheckedChange={(c) =>
            (setUserSettings.hideItemMarginAndDiscounts = c)
          }
          label={ts("hideItemMarginAndDiscounts")}
        />
      </FieldSet>
    </>
  )
}
