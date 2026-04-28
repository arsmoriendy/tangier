import { Form, useAppForm } from "@/components/form"
import {
  RadioGroupChoiceCard,
  RadioGroupChoiceItem,
} from "@/components/ui/choice-card"
import { FieldLegend, FieldSet } from "@/components/ui/field"
import { ItemWithRelations } from "@/lib/crud/item"
import { priceGroups } from "@/lib/db/schema"
import { formatCurrency } from "@/lib/i18n/currency"
import { useEffect, useState } from "react"
import z from "zod"
import { listPriceGroups } from "@/lib/crud/price-group"
import { SearchItemForm } from "@/app/transactions/new/search-item-form"

const addItemFormSchema = z.object({
  name: z.string().min(1),
  unitPrice: z.number().min(0),
  quantity: z.number().min(1),
  quantifiedPrice: z.number().min(0),
})

export function AddItemForm(props: {
  addItem: (item: z.infer<typeof addItemFormSchema>) => any
  setSelectedPriceGroupName: (pg: string) => any
}) {
  const defaultValues: z.infer<typeof addItemFormSchema> = {
    name: "",
    unitPrice: 0,
    quantity: 1,
    quantifiedPrice: 0,
  }

  const form = useAppForm({
    defaultValues,
    validators: { onMount: addItemFormSchema, onChange: addItemFormSchema },
    onSubmit: ({ value }) => {
      props.addItem(value)
      setItemPriceGroups([])
      form.reset()
    },
  })

  const [priceGroupsState, setPriceGroupsState] = useState<
    (typeof priceGroups.$inferSelect)[]
  >([])
  const [itemPriceGroups, setItemPriceGroups] = useState<
    ItemWithRelations["prices"]
  >([])
  const [selectedPriceGroupId, setSelectedPriceGroupId] = useState<string>()

  async function handleSelectItem({ name, prices }: ItemWithRelations) {
    form.setFieldValue("name", name)
    form.setFieldValue(
      "unitPrice",
      prices.find((p) => p.priceGroup.id === selectedPriceGroupId)?.price ?? 0
    )

    setItemPriceGroups(prices)
  }

  useEffect(() => {
    listPriceGroups().then((pgs) => {
      setPriceGroupsState(pgs)
      setSelectedPriceGroupId(pgs[0]?.id)
      props.setSelectedPriceGroupName(pgs[0]?.name)
    })
  }, [])

  return (
    <>
      <SearchItemForm selectItemPrice={handleSelectItem} />

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
            value={selectedPriceGroupId}
            onValueChange={(v) => {
              setSelectedPriceGroupId(v)
              form.setFieldValue(
                "unitPrice",
                itemPriceGroups.find((p) => p.priceGroup.id === v)?.price ?? 0
              )
              props.setSelectedPriceGroupName(
                priceGroupsState.find((pgs) => pgs.id === v)!.name
              )
            }}
          >
            {priceGroupsState.map((pg, i) => (
              <RadioGroupChoiceItem
                className="bg-background"
                key={i}
                value={pg.id}
                title={formatCurrency(
                  itemPriceGroups.find((p) => p.priceGroup.id === pg.id)
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
