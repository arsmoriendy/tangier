"use client"

import { Form, useAppForm } from "@/components/form"
import { FieldLegend, FieldSet } from "@/components/ui/field"
import { useBarcodeGroups } from "@/contexts/barcode-groups-ctx"
import { createBarcodeGroup, listBarcodeGroups } from "@/lib/crud/barcode-group"
import z from "zod"

const createBarcodeGroupFormSchema = z.object({
  name: z.string().min(1),
})

export default function CreateBarcodeGroupForm() {
  const { setBarcodeGroups } = useBarcodeGroups()
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
      <FieldLegend>Add barcode group</FieldLegend>

      <Form handleSubmit={form.handleSubmit}>
        <form.AppField
          name="name"
          children={(f) => <f.TextField label="Name" />}
        />

        <form.AppForm>
          <form.SubmitButton>Create barcode group</form.SubmitButton>
        </form.AppForm>
      </Form>
    </FieldSet>
  )
}
