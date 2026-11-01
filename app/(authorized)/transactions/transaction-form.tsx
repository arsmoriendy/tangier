"use client"

import { useAppForm } from "@/components/form"
import { HandIcon } from "@phosphor-icons/react"
import {
  createTransaction,
  TransactionWithRelations,
  updateTransaction,
} from "@/lib/crud/transactions"
import { printTrxReceipt } from "@/lib/print-trx-receipt"
import {
  transactionSchema,
  defaultTransactionValues,
} from "@/app/(authorized)/transactions/transaction-schema"
import { updateBuyPriceStock } from "@/lib/crud/buy-prices"
import { useSession } from "@/contexts/session-ctx"
import { toast } from "sonner"
import { useState } from "react"
import { usePriceGroups } from "@/contexts/price-groups-ctx"
import { useTranslations } from "next-intl"
import { TransactionItemTable } from "@/app/(authorized)/transactions/transaction-item-table"
import { TransactionFooter } from "@/app/(authorized)/transactions/transaction-footer"
import { useUserSettings } from "@/contexts/user-settings"
import { TransactionSummaryDialog } from "@/app/(authorized)/transactions/transaction-summary-dialog"
import { quantifiedSellPrice } from "@/lib/quantified-sell-price"
import { cn } from "@/lib/utils"
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
  const [openRecallDialog, setOpenRecallDialog] = useState(false)
  const [recalledTrx, setRecalledTrx] = useState<
    TransactionWithRelations | undefined
  >(undefined)
  const [getOpenSummary, setOpenSummary] = useState<boolean>(false)
  const { getUserSettings } = useUserSettings()
  const [selected, setSelected] = useState<Set<number>>(new Set())
  const t = useTranslations("transactions.form")
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

        <TransactionFooter
          form={form}
          selected={selected}
          setSelected={setSelected}
          recalledTrx={recalledTrx}
          setRecalledTrx={setRecalledTrx}
          openRecallDialog={openRecallDialog}
          setOpenRecallDialog={setOpenRecallDialog}
          hideHoldRecall={props.transaction !== undefined}
          onHold={hold}
          onCancelRecall={cancelRecall}
        />
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
