"use client"

import { FieldSet, FieldLegend } from "@/components/ui/field"
import { useUserSettings } from "@/contexts/user-settings"
import { useTranslations } from "next-intl"
import { Form, useAppForm } from "@/components/form"
import { Settings, updateSettings } from "@/lib/crud/settings"
import { toast } from "sonner"
import z from "zod"
import OptionCheckbox from "@/app/(authorized)/options/option-checkbox"
import AdminOnly from "@/components/admin-only"

const receiptFormSchema = z.object({
  receiptHeader: z.string().optional(),
  receiptFooter: z.string().optional(),
})

export default function OptionsForm({
  initialData,
}: {
  initialData: Settings
}) {
  const t = useTranslations("options")
  const ts = useTranslations("userSettings")
  const tr = useTranslations("receipt")
  const { setUserSettings, getUserSettings } = useUserSettings()

  const defaultValues: z.infer<typeof receiptFormSchema> = {
    receiptHeader: initialData.receiptHeader ?? "",
    receiptFooter: initialData.receiptFooter ?? "",
  }

  const form = useAppForm({
    defaultValues,
    onSubmit: async ({ value }) => {
      await updateSettings(value)
      toast.success(tr("toast.updated"))
    },
  })

  return (
    <>
      <FieldSet>
        <FieldLegend>{t("userSettings")}</FieldLegend>

        <FieldSet>
          <FieldLegend variant="label">{t("transactionForm")}</FieldLegend>

          <AdminOnly>
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
          </AdminOnly>

          <OptionCheckbox
            checked={getUserSettings.showTrxSummary}
            onCheckedChange={(c) => (setUserSettings.showTrxSummary = c)}
            label={ts("showTrxSummary")}
          />
          <OptionCheckbox
            checked={getUserSettings.decrementStock}
            onCheckedChange={(c) => (setUserSettings.decrementStock = c)}
            label={ts("decrementStock")}
          />
        </FieldSet>

        <FieldSet>
          <FieldLegend variant="label">{t("historyPage")}</FieldLegend>

          <AdminOnly>
            <OptionCheckbox
              checked={getUserSettings.hideHistoryReports}
              onCheckedChange={(c) => (setUserSettings.hideHistoryReports = c)}
              label={ts("hideHistoryReports")}
            />
          </AdminOnly>

          <OptionCheckbox
            checked={getUserSettings.showHisotryItems}
            onCheckedChange={(c) => (setUserSettings.showHisotryItems = c)}
            label={ts("showHisotryItems")}
          />
        </FieldSet>

        <FieldSet>
          <FieldLegend variant="label">{t("miscellaneous")}</FieldLegend>

          <AdminOnly>
            <OptionCheckbox
              checked={getUserSettings.hideMarginAndDiscounts}
              onCheckedChange={(c) =>
                (setUserSettings.hideMarginAndDiscounts = c)
              }
              label={ts("hideTrxMarginAndDiscounts")}
            />
          </AdminOnly>

          <OptionCheckbox
            checked={getUserSettings.uppercaseInput}
            onCheckedChange={(c) => (setUserSettings.uppercaseInput = c)}
            label={ts("uppercaseInput")}
          />
        </FieldSet>
      </FieldSet>

      <FieldSet>
        <FieldLegend variant="label">{tr("title")}</FieldLegend>

        <Form handleSubmit={form.handleSubmit}>
          <form.AppField name="receiptHeader">
            {(f) => <f.TextareaField label={tr("receiptHeader")} />}
          </form.AppField>

          <form.AppField name="receiptFooter">
            {(f) => <f.TextareaField label={tr("receiptFooter")} />}
          </form.AppField>

          <form.AppForm>
            <form.SubmitButton>{tr("save")}</form.SubmitButton>
          </form.AppForm>
        </Form>
      </FieldSet>
    </>
  )
}
