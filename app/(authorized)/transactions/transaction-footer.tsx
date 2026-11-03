"use client"

import { Form, withForm } from "@/components/form"
import {
  ClockCountdownIcon,
  HandIcon,
  PrinterIcon,
  TrashIcon,
} from "@phosphor-icons/react"
import { XIcon } from "@phosphor-icons/react/dist/ssr"
import { AddItemForm } from "@/app/(authorized)/transactions/add-item-form"
import { AddItemProvider } from "@/app/(authorized)/transactions/add-item-ctx"
import { defaultTransactionValues } from "@/app/(authorized)/transactions/transaction-schema"
import { PriceGroupBadge } from "@/app/(authorized)/transactions/price-group-badge"
import { RecallDialog } from "@/app/(authorized)/transactions/recall-dialog"
import {
  listTransactions,
  TransactionWithRelations,
} from "@/lib/crud/transactions"
import { useHeld } from "@/app/(authorized)/transactions/held-ctx"
import { useUserSettings } from "@/contexts/user-settings"
import { useTranslations } from "next-intl"
import { ComponentProps } from "react"
import { Badge } from "@/components/ui/badge"
import { ButtonWithHotkeys } from "@/components/ui/button-with-hotkeys"
import { Kbd } from "@/components/ui/kbd"
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { ResetButton } from "@/components/reset-button"
import AdminOnly from "@/components/admin-only"
import { formatCurrency } from "@/lib/i18n/currency"
import { marginAndDiscount } from "@/lib/margin"
import { cn } from "@/lib/utils"
import { usePriceGroups } from "@/contexts/price-groups-ctx"
import { toFormItem } from "@/app/(authorized)/transactions/transaction-item-mapper"
import { toast } from "sonner"

function FooterBar({ className, ...props }: ComponentProps<"div">) {
  return (
    <div
      className={cn(
        "relative flex justify-between gap-2 border bg-sidebar p-2 text-sidebar-foreground",
        className
      )}
      {...props}
    />
  )
}

function RecallBadge({ onCancelRecall }: { onCancelRecall: () => void }) {
  const t = useTranslations("transactions.form")

  return (
    <Badge className="absolute -top-4 right-2 gap-2">
      <span className="relative size-2">
        <span className="absolute size-full animate-ping rounded-full bg-warning opacity-75" />
        <span className="flex size-full rounded rounded-full bg-warning" />
      </span>

      <span>Recalled</span>

      <Tooltip>
        <TooltipTrigger asChild>
          <button onClick={() => onCancelRecall()}>
            <XIcon />
          </button>
        </TooltipTrigger>
        <TooltipContent>
          {t("cancelRecall")} <Kbd>Ctrl + F6</Kbd>
        </TooltipContent>
      </Tooltip>
    </Badge>
  )
}

function MarginBadge({
  values: v,
}: {
  values: typeof defaultTransactionValues
}) {
  const expenses = v.transactionItems.reduce(
    (acc, item) => (acc += item.buyPrice * item.quantity),
    0
  )
  const { margin: profitLoss } = marginAndDiscount(v.totalPrice, expenses)

  return (
    <Badge variant="secondary">
      <span>Margin:</span>
      <span
        className={cn(
          profitLoss < 0 ? "text-destructive-foreground" : "text-success"
        )}
      >
        {profitLoss > 0 && "+"}
        {formatCurrency(profitLoss)}
      </span>
    </Badge>
  )
}

export const TransactionFooter = withForm({
  defaultValues: defaultTransactionValues,
  props: {
    selected: new Set<number>(),
    setSelected: (_selected: Set<number>) => {},
    recalledTrx: undefined as TransactionWithRelations | undefined,
    setRecalledTrx: (_trx: TransactionWithRelations | undefined) => {},
    openRecallDialog: false,
    setOpenRecallDialog: (_open: boolean) => {},
    hideHoldRecall: false,
    onHold: () => {},
    onCancelRecall: () => {},
  },
  render: function Render({
    form,
    selected,
    setSelected,
    recalledTrx,
    setRecalledTrx,
    openRecallDialog,
    setOpenRecallDialog,
    hideHoldRecall,
    onHold,
    onCancelRecall,
  }) {
    const { getUserSettings } = useUserSettings()
    const { setHeld } = useHeld()
    const { priceGroups } = usePriceGroups()
    const t = useTranslations("transactions.form")
    const tc = useTranslations("common")

    function removeSelectedItems() {
      for (const s of selected) {
        form.removeFieldValue("transactionItems", s)
      }
      setSelected(new Set())
    }

    async function refreshHeldTrxs() {
      setHeld.splice(
        0,
        setHeld.length,
        ...(await listTransactions({
          held: true,
          from: new Date(0),
          to: new Date(),
        }))
      )
    }

    async function recallTrx(trx: DeepReadonly<TransactionWithRelations>) {
      setRecalledTrx(trx as DeepMutable<typeof trx>)

      form.setFieldValue(
        "priceGroup",
        priceGroups.find((pg) => pg.name === trx.customerPriceGroup)?.id
      )
      form.setFieldValue("totalPrice", trx.totalPrice)
      form.setFieldValue(
        "transactionItems",
        (trx.transactionItems as DeepMutable<typeof trx.transactionItems>).map(
          toFormItem
        )
      )

      setOpenRecallDialog(false)
    }

    return (
      <div className="sticky bottom-0 space-y-2 bg-background">
        <FooterBar>
          <AddItemProvider>
            <AddItemForm form={form} />
          </AddItemProvider>
        </FooterBar>

        <FooterBar>
          <div className="absolute -top-4 left-2 flex gap-2">
            <Badge>{tc("totalPrice")}</Badge>

            <form.Subscribe selector={(f) => f.values.priceGroup}>
              {(priceGroup) => (
                <PriceGroupBadge
                  value={priceGroup}
                  onChange={(id) => form.setFieldValue("priceGroup", id)}
                />
              )}
            </form.Subscribe>

            <AdminOnly>
              {getUserSettings.showMarginAndDiscounts && (
                <form.Subscribe selector={(f) => f.values}>
                  {(v) => <MarginBadge values={v} />}
                </form.Subscribe>
              )}
            </AdminOnly>
          </div>

          {recalledTrx !== undefined && (
            <RecallBadge onCancelRecall={onCancelRecall} />
          )}

          <form.AppField name="totalPrice">
            {(field) => <field.IdrField min={0} className="max-w-xs" />}
          </form.AppField>

          <div className="flex gap-2">
            <ButtonWithHotkeys
              hotkeys={["Ctrl+d"]}
              variant="destructive"
              disabled={selected.size < 1}
              onClick={() => removeSelectedItems()}
            >
              <TrashIcon />
              {t("removeItems", { count: selected.size })}
            </ButtonWithHotkeys>

            <ResetButton hotkeys={["F4"]} onClick={() => form.reset()} />

            {!hideHoldRecall && (
              <>
                <form.Subscribe selector={(form) => form.canSubmit}>
                  {(canSubmit) => (
                    <ButtonWithHotkeys
                      type="button"
                      onClick={onHold}
                      hotkeys={["F5"]}
                      disabled={!canSubmit}
                    >
                      <HandIcon /> <span>Hold</span>
                    </ButtonWithHotkeys>
                  )}
                </form.Subscribe>

                <ButtonWithHotkeys
                  type="button"
                  hotkeys={["F6"]}
                  onClick={async () => {
                    await refreshHeldTrxs()

                    switch (setHeld.length) {
                      case 0:
                        toast.error(t("toasts.emptyHeldList"))
                        break
                      case 1:
                        recallTrx(setHeld[0])
                        break
                      default:
                        setOpenRecallDialog(true)
                        break
                    }
                  }}
                >
                  <ClockCountdownIcon /> <span>Recall</span>
                </ButtonWithHotkeys>

                <RecallDialog
                  form={form}
                  open={openRecallDialog}
                  setOpen={setOpenRecallDialog}
                  recalledTrx={recalledTrx}
                  setRecalledTrx={setRecalledTrx}
                  recallTrx={recallTrx}
                />
              </>
            )}

            <Form handleSubmit={form.handleSubmit}>
              <form.AppForm>
                <form.SubmitButton hotkeys={["F7"]}>
                  <PrinterIcon /> {t("saveAndPrint")}
                </form.SubmitButton>
              </form.AppForm>
            </Form>
          </div>
        </FooterBar>
      </div>
    )
  },
})
