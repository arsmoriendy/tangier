"use client"

import { Form, useAppForm } from "@/components/form"
import { FieldLegend, FieldSet } from "@/components/ui/field"
import { useUnits } from "@/contexts/units-ctx"
import { createUnit, listUnits } from "@/lib/crud/units"
import { useTranslations } from "next-intl"
import z from "zod"

const createUnitFormSchema = z.object({
  name: z.string().min(1),
})

export default function CreateUnitForm() {
  const { setUnits } = useUnits()
  const t = useTranslations("units")
  const ct = useTranslations("common")
  const defaultValues: z.infer<typeof createUnitFormSchema> = {
    name: "",
  }

  const form = useAppForm({
    defaultValues,
    validators: {
      onMount: createUnitFormSchema,
      onChange: createUnitFormSchema,
    },
    onSubmit: async ({ value }) => {
      await createUnit(value)
      setUnits(await listUnits())
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
