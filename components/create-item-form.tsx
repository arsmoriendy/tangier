"use client"

import { Form, useAppForm } from "@/components/form"
import { createItem } from "@/lib/crud/item"
import { listPriceGroups } from "@/lib/crud/price-group"
import { useEffect, useState } from "react"
import * as z from "zod"

const createItemFormSchema = z.object({
  name: z.string().min(1),
  stock: z.number().min(0),
  prices: z.array(z.object({ priceGroup: z.uuid(), price: z.number().min(0) })),
})

export default function CreateItemForm() {
  const defaultValues: z.infer<typeof createItemFormSchema> = {
    name: "",
    stock: 0,
    prices: [],
  }

  const form = useAppForm({
    defaultValues,
    validators: {
      onChange: createItemFormSchema,
      onMount: createItemFormSchema,
    },
    onSubmit: async ({ value }) => {
      await createItem(value)
    },
  })

  const [priceGroupNames, setPriceGroupNames] = useState<string[]>([])

  useEffect(() => {
    listPriceGroups().then((pgs) =>
      pgs.forEach((pg) => {
        setPriceGroupNames((old) => [...old, pg.name])
        form.pushFieldValue("prices", { price: 0, priceGroup: pg.id })
      })
    )
  }, [])

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
      {priceGroupNames.map((name, i) => (
        <div key={i}>
          <form.Field name={`prices[${i}].priceGroup`}>
            {(f) => <input type="hidden" value={f.state.value} />}
          </form.Field>
          <form.AppField name={`prices[${i}].price`}>
            {(f) => <f.NumberField label={name} />}
          </form.AppField>
        </div>
      ))}
      <form.AppForm>
        <form.SubmitButton>Create item</form.SubmitButton>
      </form.AppForm>
    </Form>
  )
}
