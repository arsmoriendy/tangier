"use client"

import chroma from "chroma-js"
import { Form, useAppForm } from "@/components/form"
import { FieldLegend, FieldSet } from "@/components/ui/field"
import {
  createItem,
  deleteItem,
  ItemWithRelations,
  updateItem,
} from "@/lib/crud/items"
import z from "zod"
import { usePriceGroups } from "@/contexts/price-groups-ctx"
import { useBarcodeGroups } from "@/contexts/barcode-groups-ctx"
import { toast } from "sonner"
import { Badge } from "@/components/ui/badge"
import { useUnits } from "@/contexts/units-ctx"
import { Button } from "@/components/ui/button"
import { TrashIcon } from "@phosphor-icons/react"
import { cn } from "@/lib/utils"
import { formatCurrency } from "@/lib/i18n/currency"

export default function ItemForm(props: {
  item?: DeepReadonly<ItemWithRelations>
  afterUpdate?: (newItem: ItemWithRelations) => any
  afterDelete?: () => any
}) {
  const { priceGroups } = usePriceGroups()
  const { barcodeGroups } = useBarcodeGroups()
  const { units } = useUnits()
  const createItemFormSchema = z.object({
    name: z.string().min(1),
    unit: z.uuid(),
    buyPrices: z.array(
      z.object({ price: z.number().min(0), stock: z.number().min(0) })
    ),
    sellPrices: z.array(
      z.object({ priceGroup: z.uuid(), price: z.number().min(0) })
    ),
    barcodes: z.array(
      z.object({ barcodeGroup: z.uuid(), barcode: z.string() })
    ),
  })
  const defaultValues: z.infer<typeof createItemFormSchema> = {
    name: "",
    unit: units[0]?.id,
    buyPrices: [],
    sellPrices: priceGroups.map(({ id }) => ({ priceGroup: id, price: 0 })),
    barcodes: barcodeGroups.map(({ id }) => ({
      barcodeGroup: id,
      barcode: "",
    })),
  }
  const form = useAppForm({
    defaultValues: props.item
      ? {
          name: props.item.name,
          unit: props.item.unit.id,
          buyPrices: props.item.buyPrices.map(({ price, stock }) => ({
            price,
            stock,
          })),
          sellPrices: priceGroups.map(({ id }) => ({
            priceGroup: id,
            price:
              props.item!.sellPrices.find((sp) => sp.priceGroup.id === id)
                ?.price ?? 0,
          })),
          barcodes: barcodeGroups.map(({ id }) => ({
            barcodeGroup: id,
            barcode:
              props.item!.barcodes.find((b) => b.barcodeGroup.id === id)
                ?.barcode ?? "",
          })),
        }
      : defaultValues,
    validators: {
      onChange: createItemFormSchema,
      onMount: createItemFormSchema,
    },
    onSubmit: async ({ value }) => {
      if (props.item) {
        const newItem = await updateItem({ ...value, id: props.item.id })
        props.afterUpdate?.(newItem)
        toast.success("Item updated")
      } else {
        await createItem(value)
        toast.success("Item created")
      }
      form.reset()
    },
  })

  return (
    <Form handleSubmit={form.handleSubmit}>
      <form.AppField name="name">
        {(f) => <f.TextField label="Name" />}
      </form.AppField>

      <FieldSet className="flex-row flex-wrap gap-2">
        <FieldLegend>Unit</FieldLegend>

        <form.Subscribe selector={(f) => f.values.unit}>
          {(unit) =>
            units.map((u, i) => (
              <Badge
                key={i}
                className="select-none"
                variant={u.id === unit ? "default" : "outline"}
                onClick={() => form.setFieldValue("unit", u.id)}
              >
                {u.name}
              </Badge>
            ))
          }
        </form.Subscribe>
      </FieldSet>

      <div className="flex gap-2">
        <FieldSet className="flex-1">
          <FieldLegend>Buy prices</FieldLegend>

          <form.Subscribe selector={(f) => f.values.buyPrices}>
            {(buyPrices) => (
              <>
                {buyPrices.map(({ price: bp }, i) => (
                  <div key={i}>
                    <div className="flex items-end gap-2">
                      <form.AppField name={`buyPrices[${i}].price`}>
                        {(f) => <f.IdrField label="Price" />}
                      </form.AppField>
                      <form.AppField name={`buyPrices[${i}].stock`}>
                        {(f) => (
                          <f.NumberField
                            className="w-24"
                            label="Stock"
                            min={0}
                          />
                        )}
                      </form.AppField>
                      <Button
                        variant="destructive"
                        size="icon"
                        type="button"
                        onClick={() => {
                          form.removeFieldValue("buyPrices", i)
                        }}
                      >
                        <TrashIcon />
                      </Button>
                    </div>
                    <div className="flex gap-2">
                      <form.Subscribe selector={(f) => f.values.sellPrices}>
                        {(sps) =>
                          sps.map(({ price: sp, priceGroup }, i) => {
                            const margin = sp - bp
                            const discount = ((bp - sp) / bp) * 100
                            const pg = priceGroups.find(
                              (pg) => pg.id === priceGroup
                            )!
                            return (
                              margin !== 0 && (
                                <small
                                  key={i}
                                  className={cn(
                                    margin < 0
                                      ? "text-destructive"
                                      : "text-green-500"
                                  )}
                                >
                                  {pg.name} margin: {margin > 0 && "+"}
                                  {formatCurrency(margin)}{" "}
                                  {margin < 0 && (
                                    <>({discount.toFixed(2)}% discount)</>
                                  )}
                                </small>
                              )
                            )
                          })
                        }
                      </form.Subscribe>
                    </div>
                  </div>
                ))}
                <Button
                  type="button"
                  onClick={() => {
                    form.pushFieldValue("buyPrices", { price: 0, stock: 0 })
                  }}
                >
                  Add buy price
                </Button>

                <Button
                  disabled={
                    buyPrices.find((bp) => bp.stock === 0) === undefined
                  }
                  type="button"
                  variant="destructive"
                  onClick={() => {
                    form.setFieldValue(
                      "buyPrices",
                      form.state.values.buyPrices.filter((bp) => bp.stock !== 0)
                    )
                  }}
                >
                  Prune empty stock prices
                </Button>
              </>
            )}
          </form.Subscribe>
        </FieldSet>

        <FieldSet className="flex-1">
          <FieldLegend>Sell prices</FieldLegend>
          {priceGroups.map(({ id, name, hexColor }, i) => (
            <div key={i}>
              <form.Field name={`sellPrices[${i}].priceGroup`}>
                {() => <input type="hidden" value={id} />}
              </form.Field>
              <form.AppField name={`sellPrices[${i}].price`}>
                {(f) => (
                  <f.IdrField
                    style={{
                      backgroundColor: chroma(`#${hexColor}`).alpha(0.33).hex(),
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

      <div className="flex gap-2">
        <form.AppForm>
          <form.SubmitButton>
            {props.item ? "Update item" : "Create item"}
          </form.SubmitButton>
        </form.AppForm>

        {props.item && (
          <Button
            type="button"
            variant="destructive"
            onClick={async () => {
              await deleteItem({ itemId: props.item!.id })
              toast.error("Item deleted")
              props.afterDelete?.()
            }}
          >
            <TrashIcon />
            Delete item
          </Button>
        )}
      </div>
    </Form>
  )
}
