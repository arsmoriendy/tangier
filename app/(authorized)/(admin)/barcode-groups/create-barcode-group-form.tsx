"use client"

import { Form, useAppForm } from "@/components/form"
import { FieldLegend, FieldSet } from "@/components/ui/field"
import { useBarcodeGroups } from "@/contexts/barcode-groups-ctx"
import { useTranslations } from "next-intl"
import {
  createBarcodeGroup,
  listBarcodeGroups,
} from "@/lib/crud/barcode-groups"
import z from "zod"

const createBarcodeGroupFormSchema = z.object({
  name: z.string().min(1),
})

export default function CreateBarcodeGroupForm() {
  const { setBarcodeGroups } = useBarcodeGroups()
  const t = useTranslations("barcodeGroups")
  const ct = useTranslations("common")
  const defaultValues: z.infer<typeof createBarcodeGroupFormSchema> = {
    name: "",
  }

  const form = useAppForm({
    defaultValues,
    validators: {
      onMount: createBarcodeGroupFormSchema,
      onChange: createBarcodeGroupFormSchema,
    },
    onSubmit: async ({ value }) => {
      await createBarcodeGroup(value)
      setBarcodeGroups(await listBarcodeGroups())
      form.reset()
    },
  })

  return (
    <FieldSet>
      <FieldLegend>{t("createNew")}</FieldLegend>

      <Form handleSubmit={form.handleSubmit}>
        <form.AppField
          name="name"
          children={(f) => <f.TextField label={ct("name")} />}
        />

        <form.AppForm>
          <form.SubmitButton>{t("form.create")}</form.SubmitButton>
        </form.AppForm>
      </Form>
    </FieldSet>
  )
}
