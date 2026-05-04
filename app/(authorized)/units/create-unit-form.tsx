"use client"

import { Form, useAppForm } from "@/components/form"
import { FieldLegend, FieldSet } from "@/components/ui/field"
import { useUnits } from "@/contexts/units-ctx"
import { createUnit, listUnits } from "@/lib/crud/units"
import z from "zod"

const createUnitFormSchema = z.object({
  name: z.string().min(1),
})

export default function CreateUnitForm() {
  const { setUnits } = useUnits()
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
      <FieldLegend>Add unit</FieldLegend>

      <Form handleSubmit={form.handleSubmit}>
        <form.AppField
          name="name"
          children={(f) => <f.TextField label="Name" />}
        />

        <form.AppForm>
          <form.SubmitButton>Create unit</form.SubmitButton>
        </form.AppForm>
      </Form>
    </FieldSet>
  )
}
