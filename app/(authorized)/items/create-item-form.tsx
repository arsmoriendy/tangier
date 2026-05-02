"use client"

import chroma from "chroma-js"
import { Form, useAppForm } from "@/components/form"
import { FieldLegend, FieldSet } from "@/components/ui/field"
import { createItem } from "@/lib/crud/item"
import z from "zod"
import { usePriceGroups } from "@/contexts/price-groups-ctx"
import { useBarcodeGroups } from "@/contexts/barcode-groups-ctx"

export default function CreateItemForm() {
  const { priceGroups } = usePriceGroups()
  const { barcodeGroups } = useBarcodeGroups()
  const createItemFormSchema = z.object({
    name: z.string().min(1),
    prices: z.array(
      z.object({ priceGroup: z.uuid(), price: z.number().min(0) })
    ),
    barcodes: z.array(
      z.object({ barcodeGroup: z.uuid(), barcode: z.string() })
    ),
  })
  const defaultValues: z.infer<typeof createItemFormSchema> = {
    name: "",
    prices: priceGroups.map(({ id }) => ({ priceGroup: id, price: 0 })),
    barcodes: barcodeGroups.map(({ id }) => ({
      barcodeGroup: id,
      barcode: "",
    })),
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

  return (
    <FieldSet>
      <FieldLegend>Add item</FieldLegend>

      <Form handleSubmit={form.handleSubmit}>
        <form.AppField name="name">
          {(f) => <f.TextField label="Name" />}
        </form.AppField>

        <div className="flex gap-2">
          <FieldSet className="flex-1">
            <FieldLegend>Prices</FieldLegend>
            {priceGroups.map(({ id, name, hexColor }, i) => (
              <div key={i}>
                <form.Field name={`prices[${i}].priceGroup`}>
                  {() => <input type="hidden" value={id} />}
                </form.Field>
                <form.AppField name={`prices[${i}].price`}>
                  {(f) => (
                    <f.IdrField
                      style={{
                        backgroundColor: chroma(`#${hexColor}`)
                          .alpha(0.33)
                          .hex(),
                      }}
                      label={name}
                      min={0}
                    />
                  )}
                </form.AppField>
              </div>
            ))}
          </FieldSet>

          <FieldSet className="flex-1">
            <FieldLegend>Barcodes</FieldLegend>
            {barcodeGroups.map(({ id, name }, i) => (
              <div key={i}>
                <form.Field name={`barcodes[${i}].barcodeGroup`}>
                  {() => <input type="hidden" value={id} />}
                </form.Field>
                <form.AppField name={`barcodes[${i}].barcode`}>
                  {(f) => <f.TextField label={`${name} barcode`} />}
                </form.AppField>
              </div>
            ))}
          </FieldSet>
        </div>

        <form.AppForm>
          <form.SubmitButton>Create item</form.SubmitButton>
        </form.AppForm>
      </Form>
    </FieldSet>
  )
}
