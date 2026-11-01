"use client"

import { Form, useAppForm } from "@/components/form"
import {
  ClockCountdownIcon,
  HandIcon,
  PrinterIcon,
  TrashIcon,
} from "@phosphor-icons/react"
import {
  createTransaction,
  listTransactions,
  TransactionWithRelations,
  updateTransaction,
} from "@/lib/crud/transactions"
import { printTrxReceipt } from "@/lib/print-trx-receipt"
import { AddItemForm } from "@/app/(authorized)/transactions/add-item-form"
import { AddItemProvider } from "@/app/(authorized)/transactions/add-item-ctx"
import {
  transactionSchema,
  defaultTransactionValues,
} from "@/app/(authorized)/transactions/transaction-schema"
import { updateBuyPriceStock } from "@/lib/crud/buy-prices"
import { useSession } from "@/contexts/session-ctx"
import { toast } from "sonner"
import { useHeld } from "./held-ctx"
import { ComponentProps, useState } from "react"
import { usePriceGroups } from "@/contexts/price-groups-ctx"
import { ResetButton } from "@/components/reset-button"
import { useTranslations } from "next-intl"
import { ButtonWithHotkeys } from "@/components/ui/button-with-hotkeys"
import { PriceGroupBadge } from "@/app/(authorized)/transactions/price-group-badge"
import { RecallDialog } from "@/app/(authorized)/transactions/recall-dialog"
import { TransactionItemTable } from "@/app/(authorized)/transactions/transaction-item-table"
import { Badge } from "@/components/ui/badge"
import { useUserSettings } from "@/contexts/user-settings"
import { TransactionSummaryDialog } from "@/app/(authorized)/transactions/transaction-summary-dialog"
import { formatCurrency } from "@/lib/i18n/currency"
import { quantifiedSellPrice } from "@/lib/quantified-sell-price"
import { marginAndDiscount } from "@/lib/margin"
import AdminOnly from "@/components/admin-only"
import { cn } from "@/lib/utils"
import { XIcon } from "@phosphor-icons/react/dist/ssr"
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { Kbd } from "@/components/ui/kbd"
import { useHotkeys } from "react-hotkeys-hook"

export default function TransactionForm({
  className,
  ...props
}: {
  transaction?: DeepReadonly<TransactionWithRelations>
  onUpdate?: (trx: TransactionWithRelations) => any
  className?: string
}) {
  const session = useSession()
  const { priceGroups } = usePriceGroups()
  const { setHeld } = useHeld()
  const [openRecallDialog, setOpenRecallDialog] = useState(false)
  const [recalledTrx, setRecalledTrx] = useState<
    TransactionWithRelations | undefined
  >(undefined)
  const [getOpenSummary, setOpenSummary] = useState<boolean>(false)
  const { getUserSettings } = useUserSettings()
  const [selected, setSelected] = useState<Set<number>>(new Set())
  const t = useTranslations("transactions.form")
  const tc = useTranslations("common")
  const form = useAppForm({
    defaultValues: (props.transaction
      ? {
          totalPrice: props.transaction.totalPrice,
          priceGroup: priceGroups.find(
            (pg) => pg.name === props.transaction!.customerPriceGroup
          )?.id,
          transactionItems: props.transaction.transactionItems.map((trx) => ({
            ...trx,
            quantifiedSellPrice: quantifiedSellPrice(trx),
          })),
        }
      : {
          ...defaultTransactionValues,
          priceGroup: priceGroups.at(0)?.id,
        }) as typeof defaultTransactionValues,
    validators: {
      onMount: transactionSchema,
      onChange: transactionSchema,
    },
    onSubmit: async ({ value: { transactionItems, priceGroup, ...value } }) => {
      const items = transactionItems
      const customerPriceGroup =
        priceGroups.find((pg) => pg.id === priceGroup)?.name ?? ""
      const trx = {
        cashier: session.user.name,
        transactionItems: items,
        customerPriceGroup,
        held: false,
        ...value,
      }

      // unique stock per buyPriceId
      const bpStockMap = new Map<string, number>()
      for (const item of transactionItems)
        if (item.updateStock && item.buyPriceId !== null) {
          const qty = bpStockMap.get(item.buyPriceId)
          bpStockMap.set(
            item.buyPriceId,
            qty === undefined ? item.quantity : qty + item.quantity
          )
        }

      for (const [id, stock] of bpStockMap) {
        let stockDelta = -stock

        // account for old quantity if any
        if (props.transaction !== undefined)
          for (const item of props.transaction.transactionItems)
            if (item.updateStock && item.buyPriceId === id)
              stockDelta += item.quantity

        await updateBuyPriceStock({
          id,
          stockDelta,
        })
      }

      var id: string
      var createdAt: string
      if (props.transaction !== undefined || recalledTrx !== undefined) {
        id = props.transaction?.id ?? recalledTrx!.id
        createdAt = props.transaction?.createdAt ?? recalledTrx!.createdAt

        await updateTransaction({
          id,
          ...trx,
        })

        toast.success(t("toasts.updated"))
        props.onUpdate?.({
          id,
          createdAt,
          ...trx,
        })
      } else {
        var { id, createdAt } = await createTransaction(trx)

        toast.success(t("toasts.created"))
      }

      try {
        await printTrxReceipt({
          id,
          createdAt,
          cashier: session.user.name,
          totalPrice: value.totalPrice,
          transactionItems: items,
          customerPriceGroup,
        })
      } catch (e) {
        toast.error(t("toasts.printError"))
      }

      setRecalledTrx(undefined)
      if (getUserSettings.showTrxSummary) setOpenSummary(true)
      else form.reset()
    },
  })

  async function hold() {
    if (form.state.values.transactionItems.length < 1) return

    const { transactionItems, priceGroup, ...value } = form.state.values
    const items = transactionItems
    const customerPriceGroup =
      priceGroups.find((pg) => pg.id === priceGroup)?.name ?? ""

    const trx = {
      transactionItems: items,
      cashier: session.user.name,
      customerPriceGroup,
      held: true,
      ...value,
    }

    if (recalledTrx) {
      await updateTransaction({
        id: recalledTrx.id,
        ...trx,
      })
    } else {
      await createTransaction(trx)
    }

    toast.success(t("toasts.held"), { icon: <HandIcon /> })
    setRecalledTrx(undefined)
    form.reset()
  }

  async function cancelRecall() {
    if (recalledTrx === undefined) return
    setRecalledTrx(undefined)
    form.reset()
    toast.info(t("toasts.recallCancelled"))
  }

  // register cancel recall hotkey
  useHotkeys("Ctrl + F6", cancelRecall, {
    preventDefault: true,
    enableOnFormTags: true,
  })

  function Footer() {
    function RecallBadge() {
      return (
        <Badge className="absolute -top-4 right-2 gap-2">
          <span className="relative size-2">
            <span className="absolute size-full animate-ping rounded-full bg-warning opacity-75" />
            <span className="flex size-full rounded rounded-full bg-warning" />
          </span>

          <span>Recalled</span>

          <Tooltip>
            <TooltipTrigger asChild>
              <button
                onClick={() => {
                  cancelRecall()
                }}
              >
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

    function MarginBadge({ values: v }: { values: typeof form.state.values }) {
      const expenses = v.transactionItems.reduce(
        (acc, item) => (acc += item.buyPrice * item.quantity),
        0
      )
      const { margin: profitLoss } = marginAndDiscount(v.totalPrice, expenses)

      return (
        <Badge variant="secondary">
          <span>Margin:</span>
          <span
            className={cn(profitLoss < 0 ? "text-destructive" : "text-success")}
          >
            {profitLoss > 0 && "+"}
            {formatCurrency(profitLoss)}
          </span>
        </Badge>
      )
    }

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

    function RecallButton() {
      return (
        <ButtonWithHotkeys
          type="button"
          hotkeys={["F6"]}
          onClick={async () => {
            await refreshHeldTrxs()
            setOpenRecallDialog(true)
          }}
        >
          <ClockCountdownIcon /> <span>Recall</span>
        </ButtonWithHotkeys>
      )
    }

    function HoldButton() {
      return (
        <form.Subscribe selector={(form) => form.canSubmit}>
          {(canSubmit) => (
            <ButtonWithHotkeys
              type="button"
              onClick={hold}
              hotkeys={["F5"]}
              disabled={!canSubmit}
            >
              <HandIcon /> <span>Hold</span>
            </ButtonWithHotkeys>
          )}
        </form.Subscribe>
      )
    }

    function Bar({ className, ...props }: ComponentProps<"div">) {
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

    return (
      <div className="sticky bottom-0 space-y-2">
        <Bar>
          <AddItemProvider>
            <AddItemForm form={form} />
          </AddItemProvider>
        </Bar>

        <Bar>
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

          {recalledTrx !== undefined && <RecallBadge />}

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

            {!props.transaction && (
              <>
                <HoldButton />
                <RecallButton />
                <RecallDialog
                  form={form}
                  open={openRecallDialog}
                  setOpen={setOpenRecallDialog}
                  recalledTrx={recalledTrx}
                  setRecalledTrx={setRecalledTrx}
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
        </Bar>
      </div>
    )
  }

  return (
    <div className={cn("flex h-full flex-col gap-2", className)}>
      <div className="relative flex flex-1 flex-col gap-2">
        <div className="h-full border">
          <TransactionItemTable
            form={form}
            selected={selected}
            setSelected={setSelected}
          />
        </div>

        <Footer />
      </div>

      <TransactionSummaryDialog
        form={form}
        open={getOpenSummary}
        onOpenChange={(v) => {
          if (!v) form.reset()
          setOpenSummary(v)
        }}
      />
    </div>
  )
}
