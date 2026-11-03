import { defaultTransactionValues } from "@/app/(authorized)/transactions/transaction-schema"
import { withForm } from "@/components/form"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Table,
  TableBody,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { useUserSettings } from "@/contexts/user-settings"
import { useIsAdmin } from "@/components/admin-only"
import { useTranslations } from "next-intl"
import { NoItemsRow } from "@/app/(authorized)/transactions/transaction-item-table/no-items-row"
import { ItemRow } from "@/app/(authorized)/transactions/transaction-item-table/item-row"
import { recalculateTotalPrice } from "@/app/(authorized)/transactions/transaction-item-table/form-helpers"
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { MinusIcon, StackMinusIcon } from "@phosphor-icons/react/dist/ssr"
import { useEffect, useRef } from "react"

export const TransactionItemTable = withForm({
  defaultValues: defaultTransactionValues,
  props: {
    selected: new Set([0]),
    setSelected: (_selected: Set<number>) => {},
    itemSignal: undefined as { index: number; token: number } | undefined,
  },
  render: function Render({ form, selected, setSelected, itemSignal }) {
    const { getUserSettings, setUserSettings } = useUserSettings()
    const t = useTranslations("transactions.form")
    const tc = useTranslations("common")
    const isAdmin = useIsAdmin()

    const showBuyPrice = isAdmin && getUserSettings.showTrxBuyPrice

    // Rows mounted with the table (e.g. when editing an existing transaction)
    // shouldn't blink; only rows appended afterwards should.
    const isFirstRender = useRef(true)
    useEffect(() => {
      isFirstRender.current = false
    }, [])

    function handleItemsChange() {
      recalculateTotalPrice(form)
    }

    function handleDecrementStockChange(
      checked: boolean,
      items: typeof form.state.values.transactionItems
    ) {
      setUserSettings.decrementStock = checked
      for (const [i, item] of items.entries())
        if (item.linkedBuyPrice !== null)
          form.setFieldValue(`transactionItems[${i}].updateStock`, checked)
    }

    return (
      <form.AppField
        name="transactionItems"
        mode="array"
        listeners={{
          onChange: handleItemsChange,
        }}
      >
        {({ state }) => (
          <Table className="w-full table-fixed border-separate border-spacing-0 pb-2">
            <colgroup>
              <col className="w-1/36" />
              <col className="w-1/36" />
              <col className="w-9/36" />
              <col className="w-3/36" />
              <col className="w-6/36" />
              {showBuyPrice && <col className="w-6/36" />}
              <col className="w-3/36" />
              <col className="w-1/36" />
              <col className="w-6/36" />
            </colgroup>

            <TableHeader className="sticky top-0 z-51 bg-background [&_th]:border-b">
              <TableRow>
                <TableHead></TableHead>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <TableHead className="px-0">
                      <form.Subscribe
                        selector={(s) => s.values.transactionItems.length}
                      >
                        {(n) => (
                          <Checkbox
                            className="mx-auto"
                            checked={selected.size === n}
                            onCheckedChange={(checked) => {
                              setSelected(
                                checked === true
                                  ? new Set(
                                      Array.from(
                                        { length: n },
                                        (_, index) => index
                                      )
                                    )
                                  : new Set()
                              )
                            }}
                          />
                        )}
                      </form.Subscribe>
                    </TableHead>
                  </TooltipTrigger>
                  <TooltipContent>{t("items.selectAll")}</TooltipContent>
                </Tooltip>
                <TableHead>{tc("name")}</TableHead>
                <TableHead>{tc("unit")}</TableHead>
                {showBuyPrice && <TableHead>{tc("buyPrice")}</TableHead>}
                <TableHead>{tc("sellPrice")}</TableHead>
                <TableHead>Qty</TableHead>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <TableHead className="px-0">
                      <Checkbox
                        className="mx-auto"
                        checked={getUserSettings.decrementStock}
                        onCheckedChange={(c) =>
                          handleDecrementStockChange(c as boolean, state.value)
                        }
                      />
                    </TableHead>
                  </TooltipTrigger>
                  <TooltipContent>{t("items.updateStock")}</TooltipContent>
                </Tooltip>
                <TableHead>{tc("quantifiedPrice")}</TableHead>
              </TableRow>
            </TableHeader>

            <TableBody>
              {state.value.length < 1 && (
                <NoItemsRow colSpan={showBuyPrice ? 9 : 8} />
              )}

              {state.value.map((item, i) => (
                <ItemRow
                  key={i}
                  form={form}
                  i={i}
                  linkedBuyPrice={item.linkedBuyPrice}
                  selected={selected}
                  setSelected={setSelected}
                  showBuyPrice={showBuyPrice}
                  blinkOnMount={!isFirstRender.current}
                  itemToken={
                    itemSignal?.index === i ? itemSignal.token : undefined
                  }
                />
              ))}
            </TableBody>
          </Table>
        )}
      </form.AppField>
    )
  },
})
