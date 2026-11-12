import { Form, useAppForm, withForm } from "@/components/form"
import { WrappedCombobox } from "@/components/wrapped-combobox"
import { MarginIndicator } from "@/components/margin-indicator"
import { MismatchIndicator } from "@/components/mismatch-indicator"
import { BuyPriceMismatchIndicator } from "@/components/buy-price-mismatch-indicator"
import { toLinkedBuyPrice } from "@/app/(authorized)/transactions/transaction-item-mapper"
import { formatCurrency } from "@/lib/i18n/currency"
import { SearchItemForm } from "@/app/(authorized)/transactions/search-item-form"
import { subscribeKey } from "valtio/utils"
import {
  addItemSchema,
  defaultAddItemValues,
} from "@/app/(authorized)/transactions/add-item-schema"
import { useAddItem } from "@/app/(authorized)/transactions/add-item-ctx"
import { defaultTransactionValues } from "@/app/(authorized)/transactions/transaction-schema"
import AdminOnly, { useIsAdmin } from "@/components/admin-only"
import { useUserSettings } from "@/contexts/user-settings"
import { cn } from "@/lib/utils"
import { useTranslations } from "next-intl"
import { useEffect, useRef } from "react"
import { useUnits } from "@/contexts/units-ctx"
import { isEqual } from "es-toolkit"
import { Kbd } from "@/components/ui/kbd"
import {
  ArrowCounterClockwiseIcon,
  CaretUpIcon,
  LinkIcon,
} from "@phosphor-icons/react/dist/ssr"
import { Badge } from "@/components/ui/badge"
import { UserIdrInput, UserIdrInputProps } from "@/components/user-idr-input"
import AppButton from "@/components/app-button"

type BuyPriceOption = {
  value: string
  label: string
  price: number
  stock: number
}

export const AddItemForm = withForm({
  defaultValues: defaultTransactionValues,
  props: {
    onItemAdded: (_index: number) => {},
  },
  render: function Render({ form: createTransactionForm, onItemAdded }) {
    const isAdmin = useIsAdmin()
    const { addItemProxy, addItemSnap } = useAddItem()
    const { getUserSettings } = useUserSettings()
    const { units } = useUnits()

    const form = useAppForm({
      defaultValues: defaultAddItemValues,
      validators: { onMount: addItemSchema, onChange: addItemSchema },
      onSubmit: ({
        value: {
          unitId,
          quantity,
          quantifiedSellPrice,
          unit: customUnit,
          ...rest
        },
      }) => {
        const unit = units.find((u) => u.id === unitId)?.name ?? customUnit

        const partialItem = {
          ...rest,
          unit,
          linkedBuyPrice: toLinkedBuyPrice(addItemProxy.buyPrice),
          updateStock: getUserSettings.decrementStock,
        }

        const idx = createTransactionForm
          .getFieldValue("transactionItems")
          .findIndex(({ quantity, quantifiedSellPrice, ...i }) =>
            isEqual(i, partialItem)
          )

        if (idx !== -1) {
          const prevQty = createTransactionForm.getFieldValue(
            `transactionItems[${idx}].quantity`
          )
          createTransactionForm.setFieldValue(
            `transactionItems[${idx}].quantity`,
            (q) => q + quantity
          )
          createTransactionForm.setFieldValue(
            `transactionItems[${idx}].quantifiedSellPrice`,
            partialItem.sellPrice * (prevQty + quantity)
          )
          onItemAdded(idx)
        } else {
          createTransactionForm.pushFieldValue("transactionItems", {
            ...partialItem,
            quantity,
            quantifiedSellPrice,
          })
          onItemAdded(
            createTransactionForm.getFieldValue("transactionItems").length - 1
          )
        }

        addItemProxy.sellPrices = []
        addItemProxy.buyPrices = []
        addItemProxy.buyPrice = undefined

        form.reset()

        nameRef.current?.focus()
      },
    })

    const t = useTranslations("transactions.form.addItem")
    const tc = useTranslations("common")

    const nameRef = useRef<HTMLInputElement>(null)
    const qtyRef = useRef<HTMLInputElement>(null)

    const buyPriceOptions: BuyPriceOption[] = addItemSnap.buyPrices
      .toReversed()
      .map((bp) => ({
        value: bp.id,
        label: formatCurrency(bp.price),
        price: bp.price,
        stock: bp.stock,
      }))

    function selectBuyPrice(bp: BuyPriceOption | null) {
      if (bp === null) {
        // Deselected: keep the entered price, but stop tracking stock for it.
        addItemProxy.buyPrice = undefined
        return
      }

      addItemProxy.buyPrice = addItemProxy.buyPrices.find(
        (b) => b.id === bp.value
      )!
      form.setFieldValue("buyPrice", bp.price)
    }

    useEffect(() => {
      // update sell price according to selected price group when an item is picked
      const unsubscribeSellPricesSync = subscribeKey(
        addItemProxy,
        "sellPrices",
        (sps) => {
          const sellPrice = sps.find(
            (sp) =>
              sp.priceGroup.id === createTransactionForm.state.values.priceGroup
          )?.price

          // no recorded price for this group: don't inherit the last item's
          form.setFieldValue("sellPrice", sellPrice ?? 0)
        }
      )

      // update sell price when a different price group is selected
      let lastPriceGroup = createTransactionForm.getFieldValue("priceGroup")
      const { unsubscribe: unsubscribePriceGroupsSync } =
        createTransactionForm.store.subscribe(({ values: { priceGroup } }) => {
          const sellPrice =
            addItemProxy.sellPrices.find(
              (sp) => sp.priceGroup.id === priceGroup
            )?.price ?? 0

          if (lastPriceGroup !== priceGroup)
            form.setFieldValue("sellPrice", sellPrice)

          lastPriceGroup = priceGroup
        })

      return () => {
        unsubscribeSellPricesSync()
        unsubscribePriceGroupsSync()
      }
    }, [])

    return (
      <>
        <SearchItemForm
          form={form}
          afterSelect={() => setTimeout(() => qtyRef.current?.focus())}
          nameRef={nameRef}
        />

        <Form className="contents" handleSubmit={form.handleSubmit}>
          <AdminOnly>
            {getUserSettings.showTrxBuyPrice && (
              <form.Subscribe
                selector={(s) =>
                  [s.values.buyPrice, s.fieldMeta.buyPrice?.isValid] as const
                }
              >
                {([bp, bpIsValid]) => (
                  <div className="relative">
                    <WrappedCombobox
                      className="relative w-31 flex-none xl:w-38"
                      contentProps={{
                        side: "top",
                        align: "end",
                        className: "w-56",
                      }}
                      options={buyPriceOptions}
                      option={
                        buyPriceOptions.find(
                          (bp) => bp.value === addItemSnap.buyPrice?.id
                        ) ?? null
                      }
                      onOptionChange={selectBuyPrice}
                      optionToLabel={(bp) => bp.label}
                      optionToValue={(bp) => bp.value}
                      emptyMessage={t("noPrice")}
                      renderOption={(bp) => (
                        <span className="flex w-full flex-col items-start">
                          <span>{bp.label}</span>
                          <span className="text-muted-foreground">
                            {tc("stockLeft", { count: bp.stock })}
                          </span>
                        </span>
                      )}
                      renderInput={({
                        // ignore key events, allow increment / decrement with arrow keys
                        // and enter to submit
                        domProps: { onKeyDown, ...domProps },
                      }) => (
                        <UserIdrInput
                          {...(domProps as UserIdrInputProps)}
                          aria-invalid={bpIsValid === false || undefined}
                          value={bp}
                          onValueChange={(value) =>
                            form.setFieldValue("buyPrice", value)
                          }
                        />
                      )}
                    />

                    <Badge className="absolute -top-6 left-0">
                      {tc("buyPrice")}
                      {addItemSnap.buyPrice && (
                        <LinkIcon data-icon="inline-end" aria-hidden />
                      )}
                    </Badge>

                    <BuyPriceMismatchIndicator
                      buyPrice={bp}
                      originalBuyPrice={addItemSnap.buyPrice?.price}
                      tooltip={tc("originalBuyPrice", {
                        price: formatCurrency(addItemSnap.buyPrice?.price ?? 0),
                      })}
                      className="absolute -top-2 -right-2 z-50"
                    />
                  </div>
                )}
              </form.Subscribe>
            )}
          </AdminOnly>

          <form.Subscribe
            selector={(f) => [f.values.buyPrice, f.values.sellPrice]}
          >
            {([bp, sp]) => (
              <div className="relative">
                <Badge className="absolute -top-6 left-0">
                  {tc("sellPrice")}
                </Badge>

                <form.AppField
                  name="sellPrice"
                  listeners={{
                    onChange: (v) =>
                      form.setFieldValue(
                        "quantifiedSellPrice",
                        v.value * form.state.values.quantity
                      ),
                  }}
                >
                  {(field) => (
                    <field.IdrField
                      className="w-31 flex-none xl:w-38"
                      inputClass={cn(
                        isAdmin &&
                          getUserSettings.coloredSellPrice &&
                          (bp > sp ? "bg-destructive" : "bg-success/33"),
                        "text-right"
                      )}
                      min={0}
                    />
                  )}
                </form.AppField>

                <AdminOnly>
                  {getUserSettings.showMarginAndDiscounts && (
                    <MarginIndicator
                      sell={sp}
                      buy={bp}
                      tooltip={tc("marginTooltip")}
                    />
                  )}
                </AdminOnly>
              </div>
            )}
          </form.Subscribe>

          <div className="relative">
            <Badge className="absolute -top-6 left-0">{tc("qty")}</Badge>
            <form.AppField
              name="quantity"
              listeners={{
                onChange: (v) =>
                  form.setFieldValue(
                    "quantifiedSellPrice",
                    v.value * form.state.values.sellPrice
                  ),
              }}
            >
              {(f) => (
                <f.NumberField
                  className="w-14 flex-none"
                  min={1}
                  ref={qtyRef}
                />
              )}
            </form.AppField>
          </div>

          <form.Subscribe
            selector={(f) => [
              f.values.quantifiedSellPrice,
              f.values.buyPrice,
              f.values.quantity,
              f.values.sellPrice,
            ]}
          >
            {([qsp, bp, qty, sp]) => (
              <div className="relative">
                <Badge className="absolute -top-6 left-0">
                  {tc("quantifiedPrice")}
                </Badge>

                <form.AppField name="quantifiedSellPrice">
                  {(field) => (
                    <field.IdrField
                      className="w-31 flex-none xl:w-38"
                      inputClass={cn(
                        isAdmin &&
                          getUserSettings.coloredSellPrice &&
                          (qsp < bp * qty ? "bg-destructive" : "bg-success/33")
                      )}
                      min={0}
                    />
                  )}
                </form.AppField>

                <AdminOnly>
                  {getUserSettings.showMarginAndDiscounts && (
                    <MarginIndicator
                      sell={qsp}
                      buy={bp * qty}
                      tooltip={tc("marginTooltip")}
                    />
                  )}
                </AdminOnly>
                <MismatchIndicator
                  sellPrice={sp}
                  quantity={qty}
                  quantifiedSellPrice={qsp}
                  tooltip={tc("mismatchTooltip")}
                />
              </div>
            )}
          </form.Subscribe>

          <div className="absolute -top-4 flex items-center gap-2">
            <form.AppForm>
              <form.SubmitButton
                size="badge"
                className="disabled:opacity-100 disabled:brightness-50"
                hotkeys={["Ctrl + Enter"]}
                hideHotkeys
                tooltip=<Kbd>Ctrl + Enter</Kbd>
              >
                <CaretUpIcon />
                {t("title")}
              </form.SubmitButton>
            </form.AppForm>

            <AppButton
              size="badge"
              type="reset"
              variant="destructive"
              hotkeys={["F2"]}
              hideHotkeys
              tooltip=<Kbd>F2</Kbd>
              onClick={() => {
                addItemProxy.sellPrices = []
                addItemProxy.buyPrices = []
                addItemProxy.buyPrice = undefined
                form.reset()
              }}
            >
              <ArrowCounterClockwiseIcon />
              {t("reset")}
            </AppButton>
          </div>
        </Form>
      </>
    )
  },
})
