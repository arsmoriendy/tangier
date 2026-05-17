import { Form, useAppForm, withForm } from "@/components/form"
import {
  RadioGroupChoiceCard,
  RadioGroupChoiceItem,
} from "@/components/ui/choice-card"
import { FieldLegend, FieldSet } from "@/components/ui/field"
import { formatCurrency } from "@/lib/i18n/currency"
import { SearchItemForm } from "@/app/(authorized)/transactions/search-item-form"
import { subscribeKey } from "valtio/utils"
import { usePriceGroups } from "@/contexts/price-groups-ctx"
import {
  addItemSchema,
  defaultAddItemValues,
} from "@/app/(authorized)/transactions/add-item-schema"
import { useAddItem } from "@/app/(authorized)/transactions/add-item-ctx"
import { defaultTransactionValues } from "@/app/(authorized)/transactions/transaction-schema"
import { ScanBarcodeField } from "@/app/(authorized)/transactions/scan-barcode-field"
import { Item } from "@/components/ui/item"
import { useLocalStorage } from "@/contexts/local-storage-ctx"
import { cn } from "@/lib/utils"
import { useSession } from "@/contexts/session-ctx"
import { Button } from "@/components/ui/button"

export const AddItemForm = withForm({
  defaultValues: defaultTransactionValues,
  render: function Render({ form: createTransactionForm }) {
    const session = useSession()
    const { priceGroups } = usePriceGroups()
    const { addItemProxy, addItemSnap } = useAddItem()
    const { getLocalStorage } = useLocalStorage()

    const form = useAppForm({
      defaultValues: defaultAddItemValues,
      validators: { onMount: addItemSchema, onChange: addItemSchema },
      onSubmit: ({ value: { quantifiedPrice, ...item } }) => {
        createTransactionForm.pushFieldValue("transactionItems", {
          ...item,
          buyPriceId: addItemProxy.buyPrice?.id ?? null,
          updateStock: getLocalStorage.decrementStock,
          extraFields: {
            quantifiedPrice,
          },
        })
        addItemProxy.sellPrices = []
        addItemProxy.buyPrices = []
        addItemProxy.buyPrice = undefined
        form.reset()
      },
    })

    subscribeKey(addItemProxy, "sellPrices", (sps) => {
      const sellPrice = sps.find(
        (sp) =>
          sp.priceGroup.id === createTransactionForm.state.values.priceGroup
      )?.price

      if (sellPrice !== undefined) form.setFieldValue("sellPrice", sellPrice)
    })

    return (
      <>
        <FieldSet className="gap-0">
          <FieldLegend>Add item</FieldLegend>

          <SearchItemForm form={form} />

          <ScanBarcodeField form={form} />

          <Form className="mt-2" handleSubmit={form.handleSubmit}>
            <createTransactionForm.Subscribe
              selector={(f) => f.values.priceGroup}
            >
              {(priceGroup) => (
                <RadioGroupChoiceCard
                  className="min-h-14 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5"
                  value={priceGroup}
                  onValueChange={(v) => {
                    form.setFieldValue(
                      "sellPrice",
                      addItemSnap.sellPrices.find((p) => p.priceGroup.id === v)
                        ?.price ?? 0
                    )
                    createTransactionForm.setFieldValue("priceGroup", v)
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
              )}
            </createTransactionForm.Subscribe>

            <div className="flex gap-2">
              {session.user.role === "admin" && (
                <FieldSet className="flex-1">
                  <FieldLegend>Buy price</FieldLegend>

                  <form.AppField name="buyPrice">
                    {(f) => <f.IdrField />}
                  </form.AppField>

                  <RadioGroupChoiceCard
                    value={addItemSnap.buyPrice?.id}
                    onValueChange={(v) => {
                      const price = parseFloat(v)
                      addItemProxy.buyPrice = addItemProxy.buyPrices.find(
                        (bp) => bp.id === v
                      )!
                      form.setFieldValue("buyPrice", price)
                    }}
                  >
                    {addItemSnap.buyPrices.length > 0 ? (
                      addItemSnap.buyPrices
                        .toReversed()
                        .map((bp, i) => (
                          <RadioGroupChoiceItem
                            key={i}
                            value={bp.id}
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
              )}

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
                    {(f) => <f.NumberField className="w-24" min={1} />}
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

            <form.Subscribe selector={(f) => [f.errors]}>
              {([errors]) =>
                errors.map((e) =>
                  e
                    ? Object.entries(e).map(([k, v], i) => (
                        <span
                          className="block text-xs text-destructive"
                          key={i}
                        >
                          {k}: {v.map((v) => v.message).join(", ")}
                        </span>
                      ))
                    : undefined
                )
              }
            </form.Subscribe>

            <div className="flex gap-2">
              <form.AppForm>
                <form.SubmitButton>Add item</form.SubmitButton>
              </form.AppForm>

              <Button
                variant="destructive"
                type="reset"
                onClick={() => {
                  addItemProxy.sellPrices = []
                  addItemProxy.buyPrices = []
                  addItemProxy.buyPrice = undefined
                  form.reset()
                }}
              >
                Reset
              </Button>
            </div>
          </Form>
        </FieldSet>
      </>
    )
  },
})
