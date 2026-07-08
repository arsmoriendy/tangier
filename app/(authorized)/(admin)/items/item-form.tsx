"use client"

import chroma from "chroma-js"
import { Form, useAppForm } from "@/components/form"
import { FieldLegend, FieldSet } from "@/components/ui/field"
import {
  countItems,
  createItem,
  deleteItem,
  ItemWithRelations,
  listItems,
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
import { useTranslations } from "next-intl"
import { useItems } from "@/contexts/items-ctx"
import { useItemFilters } from "@/app/(authorized)/(admin)/items/item-filters-ctx"
import { useItemCount } from "@/app/(authorized)/(admin)/items/item-count-ctx"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

export default function ItemForm(props: {
  item?: DeepReadonly<ItemWithRelations>
  afterUpdate?: (newItem: ItemWithRelations) => any
  afterDelete?: () => any
}) {
  const t = useTranslations("items")
  const tc = useTranslations("common")
  const { priceGroups } = usePriceGroups()
  const { barcodeGroups } = useBarcodeGroups()
  const { units } = useUnits()
  const { itemsProxy } = useItems()
  const { itemFiltersProxy } = useItemFilters()
  const { setItemCount } = useItemCount()
  const createItemFormSchema = z.object({
    name: z.string().min(1),
    unit: z.uuid(),
    buyPrices: z.array(
      z.object({
        id: z.uuid().optional(),
        price: z.number().min(0),
        stock: z.number(),
      })
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
          buyPrices: props.item.buyPrices.map(({ price, stock, id }) => ({
            id,
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
        toast.success(t("toast.updated"))
      } else {
        await createItem(value)
        toast.success(t("toast.created"))
      }

      // update item list
      itemsProxy.splice(
        0,
        itemsProxy.length,
        ...(await listItems(itemFiltersProxy))
      )
      setItemCount(await countItems(itemFiltersProxy))

      form.reset()
    },
  })

  return (
    <Form handleSubmit={form.handleSubmit}>
      <form.AppField name="name">
        {(f) => <f.TextField label={tc("name")} />}
      </form.AppField>

      <FieldSet className="flex-row flex-wrap gap-2">
        <FieldLegend>{tc("unit")}</FieldLegend>

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
          <FieldLegend>{tc("buyPrices")}</FieldLegend>

          <form.Subscribe selector={(f) => f.values.buyPrices}>
            {(buyPrices) => (
              <>
                {buyPrices.map(({ price: bp }, i) => (
                  <div key={i}>
                    <div className="flex gap-2">
                      <form.AppField name={`buyPrices[${i}].price`}>
                        {(f) => <f.IdrField label={tc("buyPrice")} />}
                      </form.AppField>
                      <form.AppField name={`buyPrices[${i}].stock`}>
                        {(f) => (
                          <f.NumberField
                            className="w-24"
                            label={tc("stock")}
                            min={0}
                          />
                        )}
                      </form.AppField>
                      <Button
                        variant="destructive"
                        size="icon"
                        type="button"
                        className="mt-6"
                        onClick={() => {
                          form.removeFieldValue("buyPrices", i)
                        }}
                      >
                        <TrashIcon />
                      </Button>
                    </div>
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead></TableHead>
                          <TableHead>Margin</TableHead>
                          <TableHead>Discount</TableHead>
                        </TableRow>
                      </TableHeader>

                      <TableBody>
                        <form.Subscribe selector={(f) => f.values.sellPrices}>
                          {(sps) =>
                            sps.map(({ price: sp, priceGroup }) => {
                              const margin = sp - bp
                              const discount =
                                bp === 0 ? 0 : ((bp - sp) / bp) * 100
                              const pg = priceGroups.find(
                                (pg) => pg.id === priceGroup
                              )!
                              return (
                                <TableRow>
                                  <TableHead>{pg.name}</TableHead>
                                  <TableCell
                                    className={cn(
                                      margin > 0 && "text-success",
                                      margin < 0 && "text-destructive"
                                    )}
                                  >
                                    {margin > 0 && "+"}
                                    {formatCurrency(margin)}
                                  </TableCell>
                                  <TableCell>{discount.toFixed(2)}%</TableCell>
                                </TableRow>
                              )
                            })
                          }
                        </form.Subscribe>
                      </TableBody>
                    </Table>
                  </div>
                ))}
                <Button
                  type="button"
                  onClick={() => {
                    form.pushFieldValue("buyPrices", { price: 0, stock: 0 })
                  }}
                >
                  {t("form.addBuyPrice")}
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
                      form.state.values.buyPrices.filter((bp) => bp.stock > 0)
                    )
                  }}
                >
                  {t("form.pruneEmptyStockPrices")}
                </Button>
              </>
            )}
          </form.Subscribe>
        </FieldSet>

        <FieldSet className="flex-1">
          <FieldLegend>{tc("sellPrices")}</FieldLegend>
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
          <FieldLegend>{t("form.barcodes")}</FieldLegend>
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
            {props.item ? t("form.update") : t("form.create")}
          </form.SubmitButton>
        </form.AppForm>

        {props.item && (
          <Button
            type="button"
            variant="destructive"
            onClick={async () => {
              await deleteItem({ itemId: props.item!.id })
              toast.error(t("toast.deleted"))
              props.afterDelete?.()
            }}
          >
            <TrashIcon />
            {t("form.delete")}
          </Button>
        )}
      </div>
    </Form>
  )
}
