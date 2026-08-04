import { Form, useAppForm, withForm } from "@/components/form"
import {
  RadioGroupChoiceCard,
  RadioGroupChoiceItem,
} from "@/components/ui/choice-card"
import { Field, FieldLabel, FieldLegend, FieldSet } from "@/components/ui/field"
import { formatCurrency } from "@/lib/i18n/currency"
import { SearchItemForm } from "@/app/(authorized)/transactions/search-item-form"
import { subscribeKey } from "valtio/utils"
import {
  addItemSchema,
  defaultAddItemValues,
} from "@/app/(authorized)/transactions/add-item-schema"
import { useAddItem } from "@/app/(authorized)/transactions/add-item-ctx"
import { defaultTransactionValues } from "@/app/(authorized)/transactions/transaction-schema"
import { Item } from "@/components/ui/item"
import { useLocalStorage } from "@/contexts/local-storage-ctx"
import { cn } from "@/lib/utils"
import { useSession } from "@/contexts/session-ctx"
import { ResetButton } from "@/components/reset-button"
import { useTranslations } from "next-intl"
import { useRef } from "react"
import { useUnits } from "@/contexts/units-ctx"
import { Checkbox } from "@/components/ui/checkbox"
import { isEqual } from "es-toolkit"
import { ListPlusIcon } from "@phosphor-icons/react"

export const AddItemForm = withForm({
  defaultValues: defaultTransactionValues,
  render: function Render({ form: createTransactionForm }) {
    const session = useSession()
    const { addItemProxy, addItemSnap } = useAddItem()
    const { getLocalStorage, setLocalStorage } = useLocalStorage()
    const { units } = useUnits()

    const form = useAppForm({
      defaultValues: defaultAddItemValues,
      validators: { onMount: addItemSchema, onChange: addItemSchema },
      onSubmit: ({ value: { quantifiedPrice, unitId, quantity, ...rest } }) => {
        const unit = units.find((u) => u.id === unitId)!.name
        const partialItem = {
          ...rest,
          unit,
          buyPriceId: addItemProxy.buyPrice?.id ?? null,
          updateStock: getLocalStorage.decrementStock,
        }

        const idx = createTransactionForm
          .getFieldValue("transactionItems")
          .findIndex(({ quantity, extraFields, ...i }) =>
            isEqual(i, partialItem)
          )

        if (idx !== -1)
          createTransactionForm.setFieldValue(
            `transactionItems[${idx}].quantity`,
            (q) => q + quantity
          )
        else
          createTransactionForm.pushFieldValue("transactionItems", {
            ...partialItem,
            quantity,
            extraFields: { quantifiedPrice },
          })

        addItemProxy.sellPrices = []
        addItemProxy.buyPrices = []
        addItemProxy.buyPrice = undefined

        form.reset()

        nameRef.current?.focus()
      },
    })

    subscribeKey(addItemProxy, "sellPrices", (sps) => {
      const sellPrice = sps.find(
        (sp) =>
          sp.priceGroup.id === createTransactionForm.state.values.priceGroup
      )?.price

      if (sellPrice !== undefined) form.setFieldValue("sellPrice", sellPrice)
    })

    const t = useTranslations("transactions.form.addItem")
    const tc = useTranslations("common")
    const tSummary = useTranslations("transactions.form.summary")

    const nameRef = useRef<HTMLInputElement>(null)
    const qtyRef = useRef<HTMLInputElement>(null)

    createTransactionForm.store.subscribe(({ values: { priceGroup } }) => {
      const sellPrice =
        addItemProxy.sellPrices.find((sp) => sp.priceGroup.id === priceGroup)
          ?.price ?? 0

      if (form.state.values.sellPrice !== sellPrice)
        form.setFieldValue("sellPrice", sellPrice)
    })

    return (
      <>
        <SearchItemForm
          form={form}
          afterSelect={() => setTimeout(() => qtyRef.current?.focus())}
          nameRef={nameRef}
        />

        <Form handleSubmit={form.handleSubmit}>
          <div className="flex gap-2">
            {session.user.role === "admin" &&
              !getLocalStorage.hideTrxBuyPrice && (
                <FieldSet className="flex-1">
                  <FieldLegend>{tc("buyPrice")}</FieldLegend>

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
                            description={tc("stockLeft", { count: bp.stock })}
                          />
                        ))
                    ) : (
                      <Item
                        className="grid min-h-17 place-items-center border-dashed text-muted-foreground"
                        variant="outline"
                      >
                        {t("noPrice")}
                      </Item>
                    )}
                  </RadioGroupChoiceCard>
                </FieldSet>
              )}

            <FieldSet className="flex-1">
              <FieldLegend>{tc("sellPrice")}</FieldLegend>
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
                    <f.NumberField className="w-24" min={1} ref={qtyRef} />
                  )}
                </form.AppField>
              </div>

              {session.user.role === "admin" &&
                !getLocalStorage.hideTrxMarginAndDiscounts && (
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
                            {tc("margin")}: {margin > 0 && "+"}
                            {formatCurrency(margin)}{" "}
                            {margin < 0 && (
                              <>
                                (
                                {tc("discountPerc", {
                                  perc: discount.toFixed(2),
                                })}
                                )
                              </>
                            )}
                          </small>
                        )
                      )
                    }}
                  </form.Subscribe>
                )}

              <form.AppField name="quantifiedPrice">
                {(field) => (
                  <field.IdrField label={tc("quantifiedPrice")} min={0} />
                )}
              </form.AppField>
            </FieldSet>
          </div>

          <div className="flex items-center gap-2">
            <form.AppForm>
              <form.SubmitButton size="xs" hotkeys={["Ctrl + Enter"]}>
                <ListPlusIcon />
                {t("title")}
              </form.SubmitButton>
            </form.AppForm>

            <ResetButton
              size="xs"
              onClick={() => {
                addItemProxy.sellPrices = []
                addItemProxy.buyPrices = []
                addItemProxy.buyPrice = undefined
                form.reset()
              }}
            />

            <div className="flex-1" />

            <Field orientation="horizontal" className="w-auto gap-2">
              <Checkbox
                checked={getLocalStorage.showTrxSummary}
                onCheckedChange={(c: boolean) =>
                  (setLocalStorage.showTrxSummary = c)
                }
              />
              <FieldLabel>{tSummary("show")}</FieldLabel>
            </Field>
          </div>
        </Form>
      </>
    )
  },
})
