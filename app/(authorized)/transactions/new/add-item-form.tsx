import { Form, useAppForm, withForm } from "@/components/form"
import {
  RadioGroupChoiceCard,
  RadioGroupChoiceItem,
} from "@/components/ui/choice-card"
import { FieldLabel, FieldLegend, FieldSet } from "@/components/ui/field"
import { formatCurrency } from "@/lib/i18n/currency"
import { useEffect } from "react"
import { SearchItemForm } from "@/app/(authorized)/transactions/new/search-item-form"
import { usePriceGroups } from "@/contexts/price-groups-ctx"
import {
  addItemSchema,
  defaultAddItemValues,
} from "@/app/(authorized)/transactions/new/add-item-schema"
import { useAddItem } from "@/app/(authorized)/transactions/new/add-item-ctx"
import { defaultCreateTransacionValues } from "@/app/(authorized)/transactions/new/create-transaction-schema"
import { ScanBarcodeField } from "@/app/(authorized)/transactions/new/scan-barcode-field"
import { useUnits } from "@/contexts/units-ctx"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Item } from "@/components/ui/item"
import { useLocalStorage } from "@/contexts/local-storage-ctx"
import { cn } from "@/lib/utils"
import { useSession } from "@/contexts/session-ctx"

export const AddItemForm = withForm({
  defaultValues: defaultCreateTransacionValues,
  render: function Render({ form: createTransactionForm }) {
    const session = useSession()
    const { priceGroups } = usePriceGroups()
    const { units } = useUnits()
    const { addItemProxy, addItemSnap } = useAddItem()
    const { getLocalStorage } = useLocalStorage()

    const form = useAppForm({
      defaultValues: { ...defaultAddItemValues, unit: units[0]?.name },
      validators: { onMount: addItemSchema, onChange: addItemSchema },
      onSubmit: ({ value: { quantifiedPrice, ...item } }) => {
        createTransactionForm.pushFieldValue("transactionItems", {
          ...item,
          extraFields: {
            quantifiedPrice,
            link: addItemProxy.link
              ? {
                  itemId: addItemProxy.link.itemId,
                  originalBuyPrice: addItemProxy.link.selectedBuyPrice,
                  updateStock: getLocalStorage.decrementStock,
                }
              : undefined,
          },
        })
        addItemProxy.sellPrices = []
        addItemProxy.buyPrices = []
        addItemProxy.link = undefined
        form.reset()
      },
    })

    useEffect(() => {
      addItemProxy.selectedPriceGroupId = priceGroups[0]?.id
      createTransactionForm.setFieldValue(
        "customerPriceGroup",
        priceGroups[0]?.name
      )
    }, [])

    return (
      <>
        <FieldSet>
          <FieldLegend>Search item</FieldLegend>
          <SearchItemForm form={form} />
        </FieldSet>

        <FieldSet>
          <FieldLegend>Scan barcode</FieldLegend>
          <ScanBarcodeField form={form} />
        </FieldSet>

        <FieldSet>
          <FieldLegend>Add item</FieldLegend>

          <Form handleSubmit={form.handleSubmit}>
            <div className="flex gap-2">
              <form.AppField name="name">
                {(field) => <field.TextField label="Name" />}
              </form.AppField>

              <span className="mt-6 grid h-8 place-items-center">/</span>

              <div className="space-y-2">
                <FieldLabel>Unit</FieldLabel>
                <form.Subscribe selector={(f) => f.values.unit}>
                  {(unit) => (
                    <Select
                      value={unit}
                      onValueChange={(v) => form.setFieldValue("unit", v)}
                    >
                      <SelectTrigger>
                        <SelectValue></SelectValue>
                      </SelectTrigger>

                      <SelectContent position="item-aligned">
                        {units.map((unit, i) => (
                          <SelectItem key={i} value={unit.name}>
                            {unit.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                </form.Subscribe>
              </div>
            </div>

            <RadioGroupChoiceCard
              className="min-h-14 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5"
              value={addItemSnap.selectedPriceGroupId}
              onValueChange={(v) => {
                addItemProxy.selectedPriceGroupId = v
                form.setFieldValue(
                  "sellPrice",
                  addItemSnap.sellPrices.find((p) => p.priceGroup.id === v)
                    ?.price ?? 0
                )
                createTransactionForm.setFieldValue(
                  "customerPriceGroup",
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
                    addItemSnap.sellPrices.find(
                      (p) => p.priceGroup.id === pg.id
                    )?.price ?? 0
                  )}
                  description={pg.name}
                />
              ))}
            </RadioGroupChoiceCard>

            <div className="flex gap-2">
              <FieldSet className="flex-1">
                <FieldLegend>Buy price</FieldLegend>

                <form.AppField name="buyPrice">
                  {(f) => <f.IdrField />}
                </form.AppField>

                <RadioGroupChoiceCard
                  value={addItemSnap.link?.selectedBuyPrice?.toString()}
                  onValueChange={(v) => {
                    const price = parseFloat(v)
                    addItemProxy.link!.selectedBuyPrice = price
                    form.setFieldValue("buyPrice", price)
                  }}
                >
                  {addItemSnap.buyPrices.length > 0 ? (
                    addItemSnap.buyPrices
                      .toReversed()
                      .map((bp, i) => (
                        <RadioGroupChoiceItem
                          key={i}
                          value={bp.price.toString()}
                          title={formatCurrency(bp.price)}
                          description={`${bp.stock} left`}
                        />
                      ))
                  ) : (
                    <Item
                      className="grid min-h-17 place-items-center border-dashed text-muted-foreground"
                      variant="outline"
                    >
                      No recorded price
                    </Item>
                  )}
                </RadioGroupChoiceCard>
              </FieldSet>

              <FieldSet className="flex-1">
                <FieldLegend>Sell price</FieldLegend>
                <div className="flex gap-2">
                  <form.AppField
                    name="sellPrice"
                    listeners={{
                      onChange: (v) =>
                        form.setFieldValue(
                          "quantifiedPrice",
                          v.value * form.state.values.quantity
                        ),
                    }}
                  >
                    {(field) => <field.IdrField min={0} />}
                  </form.AppField>

                  <span className="grid h-8 place-items-center">x</span>

                  <form.AppField
                    name="quantity"
                    listeners={{
                      onChange: (v) =>
                        form.setFieldValue(
                          "quantifiedPrice",
                          v.value * form.state.values.sellPrice
                        ),
                    }}
                  >
                    {(f) => (
                      <f.NumberField className="w-24" min={1} tabIndex={1} />
                    )}
                  </form.AppField>
                </div>

                {session.user.role === "admin" && (
                  <form.Subscribe
                    selector={(f) => [f.values.buyPrice, f.values.sellPrice]}
                  >
                    {([bp, sp]) => {
                      const margin = sp - bp
                      const discount = ((bp - sp) / bp) * 100
                      return (
                        margin !== 0 && (
                          <small
                            className={cn(
                              margin < 0 ? "text-destructive" : "text-green-500"
                            )}
                          >
                            Margin: {margin > 0 && "+"}
                            {formatCurrency(margin)}{" "}
                            {margin < 0 && (
                              <>({discount.toFixed(2)}% discount)</>
                            )}
                          </small>
                        )
                      )
                    }}
                  </form.Subscribe>
                )}

                <form.AppField name="quantifiedPrice">
                  {(field) => (
                    <field.IdrField label="Quantified price" min={0} />
                  )}
                </form.AppField>
              </FieldSet>
            </div>

            <form.AppForm>
              <form.SubmitButton>Add item</form.SubmitButton>
            </form.AppForm>
          </Form>
        </FieldSet>
      </>
    )
  },
})
