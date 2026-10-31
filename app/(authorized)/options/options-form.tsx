"use client"

import { FieldSet, FieldLegend } from "@/components/ui/field"
import { useUserSettings } from "@/contexts/user-settings"
import { useTranslations } from "next-intl"
import { Form, useAppForm } from "@/components/form"
import { Settings, updateSettings } from "@/lib/crud/settings"
import { toast } from "sonner"
import z from "zod"
import PageTitle from "@/components/page-title"
import OptionCheckbox from "@/app/(authorized)/options/option-checkbox"
import AdminOptionForms from "@/app/(authorized)/options/admin-option-forms"

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

        <AdminOptionForms />

        <FieldSet>
          <FieldLegend variant="label">{t("miscellaneous")}</FieldLegend>
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
