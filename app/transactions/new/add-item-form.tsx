import { Form, useAppForm } from "@/components/form"
import {
  RadioGroupChoiceCard,
  RadioGroupChoiceItem,
} from "@/components/ui/choice-card"
import { FieldLegend, FieldSet } from "@/components/ui/field"
import { formatCurrency } from "@/lib/i18n/currency"
import { useEffect } from "react"
import z from "zod"
import { SearchItemForm } from "@/app/transactions/new/search-item-form"
import { usePriceGroups } from "@/contexts/price-groups-ctx"
import {
  addItemSchema,
  defaultAddItemValues,
} from "@/app/transactions/new/add-item-schema"
import { useAddItem } from "@/app/transactions/new/add-item-ctx"

export function AddItemForm(props: {
  addItem: (item: z.infer<typeof addItemSchema>) => any
  setSelectedPriceGroupName: (pg: string) => any
}) {
  const { priceGroups } = usePriceGroups()
  const { addItemProxy, addItemSnap } = useAddItem()

  const form = useAppForm({
    defaultValues: defaultAddItemValues,
    validators: { onMount: addItemSchema, onChange: addItemSchema },
    onSubmit: ({ value }) => {
      props.addItem(value)
      addItemProxy.itemPrices = []
      form.reset()
    },
  })

  useEffect(() => {
    addItemProxy.selectedPriceGroupId = priceGroups[0]?.id
    props.setSelectedPriceGroupName(priceGroups[0]?.name)
  }, [])

  return (
    <>
      <SearchItemForm form={form} />

      <FieldSet>
        <FieldLegend>Add item</FieldLegend>

        <Form handleSubmit={form.handleSubmit}>
          <div className="flex gap-2">
            <form.AppField name="name">
              {(field) => <field.TextField label="Name" />}
            </form.AppField>
          </div>

          <RadioGroupChoiceCard
            className="min-h-14 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5"
            value={addItemSnap.selectedPriceGroupId}
            onValueChange={(v) => {
              addItemProxy.selectedPriceGroupId = v
              form.setFieldValue(
                "unitPrice",
                addItemSnap.itemPrices.find((p) => p.priceGroup.id === v)
                  ?.price ?? 0
              )
              props.setSelectedPriceGroupName(
                priceGroups.find((pgs) => pgs.id === v)!.name
              )
            }}
          >
            {priceGroups.map((pg, i) => (
              <RadioGroupChoiceItem
                key={i}
                style={{ backgroundColor: `#${pg.hexColor}` }}
                value={pg.id}
                title={formatCurrency(
                  addItemSnap.itemPrices.find((p) => p.priceGroup.id === pg.id)
                    ?.price ?? 0
                )}
                description={pg.name}
              />
            ))}
          </RadioGroupChoiceCard>

          <div className="flex gap-2">
            <form.AppField
              name="unitPrice"
              listeners={{
                onChange: (v) =>
                  form.setFieldValue(
                    "quantifiedPrice",
                    v.value * form.state.values.quantity
                  ),
              }}
            >
              {(field) => <field.IdrField min={0} label="Unit price" />}
            </form.AppField>
            <span className="mt-6 grid h-8 place-items-center">x</span>
            <form.AppField
              name="quantity"
              listeners={{
                onChange: (v) =>
                  form.setFieldValue(
                    "quantifiedPrice",
                    v.value * form.state.values.unitPrice
                  ),
              }}
            >
              {(f) => (
                <f.NumberField
                  className="w-24"
                  min={1}
                  label="Qty"
                  tabIndex={1}
                />
              )}
            </form.AppField>
          </div>
          <form.AppField name="quantifiedPrice">
            {(field) => <field.IdrField label="Quantified price" min={0} />}
          </form.AppField>
          <form.AppForm>
            <form.SubmitButton>Add item</form.SubmitButton>
          </form.AppForm>
        </Form>
      </FieldSet>
    </>
  )
}
