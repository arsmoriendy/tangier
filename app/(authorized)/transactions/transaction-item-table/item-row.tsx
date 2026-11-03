import { defaultTransactionValues } from "@/app/(authorized)/transactions/transaction-schema"
import type { TransactionSchema } from "@/app/(authorized)/transactions/transaction-schema"
import { withForm } from "@/components/form"
import { Checkbox } from "@/components/ui/checkbox"
import { Field } from "@/components/ui/field"
import { TableCell, TableRow } from "@/components/ui/table"
import { useUserSettings } from "@/contexts/user-settings"
import AdminOnly, { useIsAdmin } from "@/components/admin-only"
import { MarginIndicator } from "@/components/margin-indicator"
import { MismatchIndicator } from "@/components/mismatch-indicator"
import { BuyPriceMismatchIndicator } from "@/components/buy-price-mismatch-indicator"
import { formatCurrency } from "@/lib/i18n/currency"
import { cn } from "@/lib/utils"
import { DotsSixVerticalIcon } from "@phosphor-icons/react"
import { useTranslations } from "next-intl"
import { itemRowDndHandlers } from "@/app/(authorized)/transactions/transaction-item-table/item-row-dnd"
import {
  recalculateTotalPrice,
  setIdempotentFieldValue,
} from "@/app/(authorized)/transactions/transaction-item-table/form-helpers"

type LinkedBuyPrice =
  TransactionSchema["transactionItems"][number]["linkedBuyPrice"]

export const ItemRow = withForm({
  defaultValues: defaultTransactionValues,
  props: {
    i: 0,
    linkedBuyPrice: null as LinkedBuyPrice,
    selected: new Set<number>(),
    setSelected: (_selected: Set<number>) => {},
    showBuyPrice: false,
  },
  render: function Render({
    form,
    i,
    linkedBuyPrice,
    selected,
    setSelected,
    showBuyPrice,
  }) {
    const { getUserSettings } = useUserSettings()
    const tc = useTranslations("common")
    const isAdmin = useIsAdmin()

    const coloredSellPrice = isAdmin && getUserSettings.coloredSellPrice

    function sellPriceClass(isLoss: boolean) {
      return cn(
        coloredSellPrice && (isLoss ? "bg-destructive" : "bg-success/33")
      )
    }

    function handleSelect(checked: boolean) {
      const newSet = new Set(selected)
      if (checked === true) newSet.add(i)
      else newSet.delete(i)
      setSelected(newSet)
    }

    function handleSellPriceChange({ value }: { value: number }) {
      setIdempotentFieldValue(
        form,
        `transactionItems[${i}].quantifiedSellPrice`,
        form.state.values.transactionItems[i].quantity * value
      )
    }

    function handleQuantityChange({ value }: { value: number }) {
      setIdempotentFieldValue(
        form,
        `transactionItems[${i}].quantifiedSellPrice`,
        form.state.values.transactionItems[i].sellPrice * value
      )
    }

    function handleQuantifiedSellPriceChange() {
      recalculateTotalPrice(form)
    }

    const dnd = itemRowDndHandlers(form, i)

    return (
      <TableRow
        draggable
        {...dnd}
        className="[&_td]:border-primary data-[drop=bottom]:[&_td]:border-b data-[drop=top]:[&_td]:border-t"
      >
        <TableCell className="cursor-grab align-top">
          <DotsSixVerticalIcon className="inline h-8" />
        </TableCell>
        <TableCell className="px-0 align-top">
          <Checkbox
            checked={selected.has(i)}
            className="mx-auto mt-2"
            onCheckedChange={handleSelect}
          />
        </TableCell>
        <TableCell className="align-top">
          <form.AppField name={`transactionItems[${i}].name`}>
            {(field) => <field.TextField />}
          </form.AppField>
        </TableCell>
        <TableCell className="align-top">
          <form.AppField name={`transactionItems[${i}].unit`}>
            {(field) => <field.TextField />}
          </form.AppField>
        </TableCell>
        {showBuyPrice && (
          <TableCell className="relative align-top">
            <form.Subscribe
              selector={(f) => f.values.transactionItems[i].buyPrice}
            >
              {(bp) => (
                <>
                  <form.AppField name={`transactionItems[${i}].buyPrice`}>
                    {(field) => <field.IdrField min={0} />}
                  </form.AppField>
                  {linkedBuyPrice && (
                    <BuyPriceMismatchIndicator
                      buyPrice={bp}
                      originalBuyPrice={linkedBuyPrice.price}
                      tooltip={tc("originalBuyPrice", {
                        price: formatCurrency(linkedBuyPrice.price),
                      })}
                      className="absolute top-0 right-0 z-50"
                    />
                  )}
                </>
              )}
            </form.Subscribe>
          </TableCell>
        )}
        <TableCell className="align-top">
          <form.Subscribe
            selector={(f) => [
              f.values.transactionItems[i].buyPrice,
              f.values.transactionItems[i].sellPrice,
            ]}
          >
            {([bp, sp]) => (
              <>
                <form.AppField
                  name={`transactionItems[${i}].sellPrice`}
                  listeners={{
                    onChange: handleSellPriceChange,
                  }}
                >
                  {(field) => (
                    <field.IdrField
                      inputClass={sellPriceClass(bp > sp)}
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
              </>
            )}
          </form.Subscribe>
        </TableCell>
        <TableCell className="align-top">
          <form.AppField
            name={`transactionItems[${i}].quantity`}
            listeners={{
              onChange: handleQuantityChange,
            }}
          >
            {(field) => <field.NumberField min={1} />}
          </form.AppField>
        </TableCell>
        <TableCell className="px-0 align-top">
          {linkedBuyPrice !== null ? (
            <Field orientation="horizontal" className="h-8 justify-center">
              <form.AppField name={`transactionItems[${i}].updateStock`}>
                {(f) => (
                  <Checkbox
                    checked={f.state.value}
                    onCheckedChange={(c) => f.setValue(c as boolean)}
                  />
                )}
              </form.AppField>
            </Field>
          ) : (
            <Field orientation="horizontal" className="h-8">
              <Checkbox disabled />
            </Field>
          )}
        </TableCell>
        <TableCell className="align-top">
          <form.Subscribe
            selector={(f) => [
              f.values.transactionItems[i].quantifiedSellPrice,
              f.values.transactionItems[i].buyPrice,
              f.values.transactionItems[i].quantity,
              f.values.transactionItems[i].sellPrice,
            ]}
          >
            {([qsp, bp, qty, sp]) => (
              <>
                <form.AppField
                  name={`transactionItems[${i}].quantifiedSellPrice`}
                  listeners={{
                    onChange: handleQuantifiedSellPriceChange,
                  }}
                >
                  {(field) => (
                    <field.IdrField
                      inputClass={sellPriceClass(qsp < bp * qty)}
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
              </>
            )}
          </form.Subscribe>
        </TableCell>
      </TableRow>
    )
  },
})
