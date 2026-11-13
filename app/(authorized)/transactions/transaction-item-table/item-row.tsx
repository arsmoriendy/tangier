import { defaultTransactionValues } from "@/app/(authorized)/transactions/transaction-schema"
import type { TransactionSchema } from "@/app/(authorized)/transactions/transaction-schema"
import { withForm } from "@/components/form"
import { Checkbox } from "@/components/ui/checkbox"
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
import { memo, useEffect, useRef, useState, type AnimationEvent } from "react"
import {
  itemRowDndHandlers,
  remapSelectedAfterMove,
} from "@/app/(authorized)/transactions/transaction-item-table/item-row-dnd"
import {
  recalculateTotalPrice,
  setIdempotentFieldValue,
} from "@/app/(authorized)/transactions/transaction-item-table/form-helpers"
import { LinkBreakIcon } from "@phosphor-icons/react/dist/ssr"
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip"

type LinkedBuyPrice =
  TransactionSchema["transactionItems"][number]["linkedBuyPrice"]

function scrollRowIntoView(row: HTMLTableRowElement) {
  row.scrollIntoView({
    block: "nearest",
    behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches
      ? "auto"
      : "smooth",
  })
}

const ItemRowWithForm = withForm({
  defaultValues: defaultTransactionValues,
  props: {
    i: 0,
    linkedBuyPrice: null as LinkedBuyPrice,
    selected: new Set<number>(),
    setSelected: (_selected: Set<number>) => {},
    showBuyPrice: false,
    blinkOnMount: false,
    itemToken: undefined as number | undefined,
  },
  render: function Render({
    form,
    i,
    linkedBuyPrice,
    selected,
    setSelected,
    showBuyPrice,
    blinkOnMount,
    itemToken,
  }) {
    const { getUserSettings } = useUserSettings()
    const t = useTranslations("transactions.form")
    const tc = useTranslations("common")
    const isAdmin = useIsAdmin()

    // Mount flips on for appended rows; merges replay it via itemToken.
    const [blinking, setBlinking] = useState(blinkOnMount)
    const rowRef = useRef<HTMLTableRowElement>(null)

    useEffect(() => {
      if (itemToken === undefined) return
      setBlinking(true)
      if (rowRef.current) scrollRowIntoView(rowRef.current)
    }, [itemToken])

    function handleBlinkEnd(e: AnimationEvent<HTMLTableRowElement>) {
      if (e.target === e.currentTarget) setBlinking(false)
    }

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

    const dnd = itemRowDndHandlers(form, i, (from, to) =>
      setSelected(remapSelectedAfterMove(selected, from, to))
    )

    return (
      <TableRow
        ref={rowRef}
        draggable
        {...dnd}
        className={cn(
          "scroll-mt-12 scroll-mb-32",
          blinking && "animate-row-blink motion-reduce:animate-none",
          "[&_td]:border-primary data-[drop=bottom]:[&_td]:border-b data-[drop=top]:[&_td]:border-t"
        )}
        onAnimationEnd={handleBlinkEnd}
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
                      inputClass={cn(sellPriceClass(bp > sp), "text-right")}
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
        <TableCell className="align-top">
          <form.AppField name={`transactionItems[${i}].updateStock`}>
            {(f) => (
              <Tooltip>
                <TooltipTrigger asChild>
                  <div>
                    {linkedBuyPrice ? (
                      <Checkbox
                        className="mx-auto mt-2"
                        checked={f.state.value}
                        onCheckedChange={(c) => f.setValue(c as boolean)}
                      />
                    ) : (
                      <LinkBreakIcon className="mx-auto mt-2" />
                    )}
                  </div>
                </TooltipTrigger>
                <TooltipContent side="bottom">
                  {t(
                    linkedBuyPrice ? "items.updateStock" : "items.noLinkedStock"
                  )}
                </TooltipContent>
              </Tooltip>
            )}
          </form.AppField>
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

// The table re-renders on every item change (array subscription); each row's
// cells subscribe to their own fields, so untouched rows can skip that pass.
export const ItemRow = memo(ItemRowWithForm)
