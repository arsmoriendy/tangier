"use client"

import { Form, useAppForm } from "@/components/form"
import { createItem } from "@/lib/crud/item"
import * as z from "zod"

const createItemFormSchema = z.object({
  name: z.string().min(1),
  stock: z.number().min(0),
})

export default function CreateItemForm() {
  const form = useAppForm({
    defaultValues: { name: "", stock: 0 },
    validators: {
      onChange: createItemFormSchema,
      onMount: createItemFormSchema,
    },
    onSubmit: async ({ value }) => {
      await createItem(value)
    },
  })

  return (
    <Form handleSubmit={form.handleSubmit}>
      <form.AppField
        name="name"
        children={(f) => <f.TextField label="Name" />}
      />
      <form.AppField
        name="stock"
        children={(f) => <f.NumberField label="Stock" />}
      />
      <form.AppForm>
        <form.SubmitButton>Create item</form.SubmitButton>
      </form.AppForm>
    </Form>
  )
}
