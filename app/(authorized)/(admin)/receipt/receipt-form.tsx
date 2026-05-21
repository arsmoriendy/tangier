"use client"

import { Form, useAppForm } from "@/components/form"
import { FieldLegend, FieldSet } from "@/components/ui/field"
import { useTranslations } from "next-intl"
import { Settings, updateSettings } from "@/lib/crud/settings"
import { toast } from "sonner"
import z from "zod"

const receiptFormSchema = z.object({
  receiptHeader: z.string().optional(),
  receiptFooter: z.string().optional(),
})

export default function ReceiptForm({
  initialData,
}: {
  initialData: Settings
}) {
  const t = useTranslations("receipt")

  const defaultValues: z.infer<typeof receiptFormSchema> = {
    receiptHeader: initialData.receiptHeader ?? "",
    receiptFooter: initialData.receiptFooter ?? "",
  }

  const form = useAppForm({
    defaultValues,
    onSubmit: async ({ value }) => {
      await updateSettings(value)
      toast.success(t("toast.updated"))
    },
  })

  return (
    <FieldSet>
      <FieldLegend>{t("title")}</FieldLegend>

      <Form handleSubmit={form.handleSubmit}>
        <form.AppField name="receiptHeader">
          {(f) => <f.TextareaField label={t("receiptHeader")} />}
        </form.AppField>

        <form.AppField name="receiptFooter">
          {(f) => <f.TextareaField label={t("receiptFooter")} />}
        </form.AppField>

        <form.AppForm>
          <form.SubmitButton hotkeys={["Ctrl+enter"]}>
            {t("save")}
          </form.SubmitButton>
        </form.AppForm>
      </Form>
    </FieldSet>
  )
}
