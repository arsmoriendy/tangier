"use client"

import { Form, useAppForm } from "@/components/form"
import { createPriceGroup } from "@/lib/crud/price-group"
import * as z from "zod"

const createPriceGroupFormSchema = z.object({ name: z.string().min(1) })

export default function CreatePriceGroupForm() {
  const form = useAppForm({
    defaultValues: { name: "" },
    validators: {
      onMount: createPriceGroupFormSchema,
      onChange: createPriceGroupFormSchema,
    },
    onSubmit: async ({ value }) => {
      await createPriceGroup(value)
    },
  })

  return (
    <Form handleSubmit={form.handleSubmit}>
      <form.AppField
        name="name"
        children={(f) => <f.TextField label="Name" />}
      />
      <form.AppForm>
        <form.SubmitButton>Create price group</form.SubmitButton>
      </form.AppForm>
    </Form>
  )
}
