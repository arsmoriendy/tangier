"use client"

import { ItemsTable } from "@/components/create-item-form/items-table"
import { Form, useAppForm } from "@/components/form"
import { FieldLegend, FieldSet } from "@/components/ui/field"
import { createItem, ItemWithRelations, listItems } from "@/lib/crud/item"
import { listPriceGroups } from "@/lib/crud/price-group"
import { useEffect, useState } from "react"
import * as z from "zod"

export default function CreateItemForm() {
  const createItemFormSchema = z.object({
    name: z.string().min(1),
    prices: z.array(
      z.object({ priceGroup: z.uuid(), price: z.number().min(0) })
    ),
  })
  const defaultValues: z.infer<typeof createItemFormSchema> = {
    name: "",
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
      await refreshItems()
    },
  })

  const [priceGroups, setPriceGroups] = useState<
    Awaited<ReturnType<typeof listPriceGroups>>
  >([])
  const [items, setItems] = useState<ItemWithRelations[]>([])

  async function refreshItems() {
    setItems(await listItems({}))
  }

  useEffect(() => {
    listPriceGroups().then((pgs) => {
      setPriceGroups(pgs)
      pgs.forEach((pg) => {
        form.pushFieldValue("prices", { price: 0, priceGroup: pg.id })
      })
    })

    refreshItems()
  }, [])

  return (
    <>
      <FieldSet>
        <FieldLegend>Add item</FieldLegend>

        <Form handleSubmit={form.handleSubmit}>
          <form.AppField name="name">
            {(f) => <f.TextField label="Name" />}
          </form.AppField>

          <FieldSet>
            <FieldLegend>Prices</FieldLegend>
            {priceGroups.map(({ id, name }, i) => (
              <div key={i}>
                <form.Field name={`prices[${i}].priceGroup`}>
                  {() => <input type="hidden" value={id} />}
                </form.Field>
                <form.AppField name={`prices[${i}].price`}>
                  {(f) => <f.IdrField label={name} min={0} />}
                </form.AppField>
              </div>
            ))}
          </FieldSet>

          <form.AppForm>
            <form.SubmitButton>Create item</form.SubmitButton>
          </form.AppForm>
        </Form>
      </FieldSet>

      <FieldSet>
        <FieldLegend>Item list</FieldLegend>

        <ItemsTable items={items} />
      </FieldSet>
    </>
  )
}
