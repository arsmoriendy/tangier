import { Form, useAppForm, withForm } from "@/components/form"
import {
  Combobox,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxInput,
  ComboboxItem,
  ComboboxList,
} from "@/components/ui/combobox"
import { MarginIndicator } from "@/components/margin-indicator"
import { MismatchIndicator } from "@/components/mismatch-indicator"
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
} from "@phosphor-icons/react/dist/ssr"
import { ButtonWithHotkeys } from "@/components/ui/button-with-hotkeys"

type BuyPriceOption = {
  value: string
  label: string
  price: number
  stock: number
}

export const AddItemForm = withForm({
  defaultValues: defaultTransactionValues,
  render: function Render({ form: createTransactionForm }) {
    const isAdmin = useIsAdmin()
    const { addItemProxy, addItemSnap } = useAddItem()
    const { getUserSettings } = useUserSettings()
    const { units } = useUnits()

    const form = useAppForm({
      defaultValues: defaultAddItemValues,
      validators: { onMount: addItemSchema, onChange: addItemSchema },
      onSubmit: ({
        value: { unitId, quantity, quantifiedSellPrice, ...rest },
      }) => {
        const unit = units.find((u) => u.id === unitId)!.name
        const partialItem = {
          ...rest,
          unit,
          buyPriceId: addItemProxy.buyPrice?.id ?? null,
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
        } else
          createTransactionForm.pushFieldValue("transactionItems", {
            ...partialItem,
            quantity,
            quantifiedSellPrice,
          })

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
      if (bp === null) return
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

          if (sellPrice !== undefined)
            form.setFieldValue("sellPrice", sellPrice)
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
              <Combobox
                items={buyPriceOptions}
                value={
                  buyPriceOptions.find(
                    (bp) => bp.value === addItemSnap.buyPrice?.id
                  ) ?? null
                }
                itemToStringValue={(bp) => bp!.label ?? ""}
                onValueChange={(bp: BuyPriceOption | null) =>
                  selectBuyPrice(bp)
                }
              >
                <ComboboxInput className="min-w-31" />
                <ComboboxContent>
                  <ComboboxEmpty>{t("noPrice")}</ComboboxEmpty>
                  <ComboboxList>
                    {(bp) => (
                      <ComboboxItem key={bp.value} value={bp}>
                        <span className="grow">{bp.label}</span>
                        <span className="text-muted-foreground">
                          {tc("stockLeft", { count: bp.stock })}
                        </span>
                      </ComboboxItem>
                    )}
                  </ComboboxList>
                </ComboboxContent>
              </Combobox>
            )}
          </AdminOnly>

          <form.Subscribe
            selector={(f) => [f.values.buyPrice, f.values.sellPrice]}
          >
            {([bp, sp]) => (
              <div>
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
                      className="min-w-29"
                      inputClass={cn(
                        isAdmin &&
                          getUserSettings.coloredSellPrice &&
                          (bp > sp ? "bg-destructive/33" : "bg-success/33")
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
              <f.NumberField className="w-14 shrink-0" min={1} ref={qtyRef} />
            )}
          </form.AppField>

          <form.Subscribe
            selector={(f) => [
              f.values.quantifiedSellPrice,
              f.values.buyPrice,
              f.values.quantity,
              f.values.sellPrice,
            ]}
          >
            {([qsp, bp, qty, sp]) => (
              <div>
                <form.AppField name="quantifiedSellPrice">
                  {(field) => (
                    <field.IdrField
                      className="min-w-31"
                      inputClass={cn(
                        isAdmin &&
                          getUserSettings.coloredSellPrice &&
                          (qsp < bp * qty
                            ? "bg-destructive/33"
                            : "bg-success/33")
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

            <ButtonWithHotkeys
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
            </ButtonWithHotkeys>
          </div>
        </Form>
      </>
    )
  },
})
