"use client"

import { Field, FieldLabel, FieldSet, FieldLegend } from "@/components/ui/field"
import { Checkbox } from "@/components/ui/checkbox"
import { useUserSettings } from "@/contexts/user-settings"
import { useTranslations } from "next-intl"
import { useSession } from "@/contexts/session-ctx"
import { Form, useAppForm } from "@/components/form"
import { Settings, updateSettings } from "@/lib/crud/settings"
import { toast } from "sonner"
import z from "zod"

const receiptFormSchema = z.object({
  receiptHeader: z.string().optional(),
  receiptFooter: z.string().optional(),
})

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

export default function OptionsForm({
  initialData,
}: {
  initialData: Settings
}) {
  const t = useTranslations("options")
  const ts = useTranslations("userSettings")
  const tr = useTranslations("receipt")
  const { user } = useSession()
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
    <FieldSet>
      <FieldLegend>{t("title")}</FieldLegend>

      {user.role === "admin" && (
        <>
          <FieldSet>
            <FieldLegend variant="legend">{t("financialInfo")}</FieldLegend>

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
                onCheckedChange={(c) =>
                  (setUserSettings.hideHistoryReports = c)
                }
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
      )}

      <FieldSet>
        <FieldLegend variant="label">{t("miscellaneous")}</FieldLegend>
        <OptionCheckbox
          checked={getUserSettings.uppercaseInput}
          onCheckedChange={(c) => (setUserSettings.uppercaseInput = c)}
          label={ts("uppercaseInput")}
        />
      </FieldSet>
    </FieldSet>
  )
}
