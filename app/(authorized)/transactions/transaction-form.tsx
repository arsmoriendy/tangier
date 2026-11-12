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
import { useSession } from "@/contexts/session-ctx"
import { toast } from "sonner"
import { useState } from "react"
import { usePriceGroups } from "@/contexts/price-groups-ctx"
import { useTranslations } from "next-intl"
import { TransactionItemTable } from "@/app/(authorized)/transactions/transaction-item-table"
import { TransactionFooter } from "@/app/(authorized)/transactions/transaction-footer"
import { useUserSettings } from "@/contexts/user-settings"
import { TransactionSummaryDialog } from "@/app/(authorized)/transactions/transaction-summary-dialog"
import {
  toFormItem,
  withBuyPriceId,
} from "@/app/(authorized)/transactions/transaction-item-mapper"
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
  const [itemSignal, setItemSignal] = useState<{
    index: number
    token: number
  }>()
  const t = useTranslations("transactions.form")
  const form = useAppForm({
    defaultValues: (props.transaction
      ? {
          totalPrice: props.transaction.totalPrice,
          priceGroup: priceGroups.find(
            (pg) => pg.name === props.transaction!.customerPriceGroup
          )?.id,
          transactionItems: props.transaction.transactionItems.map(toFormItem),
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
      const items = transactionItems.map(withBuyPriceId)
      const customerPriceGroup =
        priceGroups.find((pg) => pg.id === priceGroup)?.name ??
        // keep the stored snapshot when its price group has been deleted
        props.transaction?.customerPriceGroup ??
        ""
      const trx = {
        cashier: session.user.name,
        transactionItems: items,
        customerPriceGroup,
        held: false,
        ...value,
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

      if (getUserSettings.showTrxSummary) {
        setRecalledTrx(undefined)
        setOpenSummary(true)
      } else resetTransactionForm()
    },
  })

  function resetTransactionForm() {
    setSelected(new Set())
    setRecalledTrx(undefined)
    form.reset()
  }

  async function hold() {
    if (form.state.values.transactionItems.length < 1) return

    const { transactionItems, priceGroup, ...value } = form.state.values
    const items = transactionItems.map(withBuyPriceId)
    const customerPriceGroup =
      priceGroups.find((pg) => pg.id === priceGroup)?.name ??
      recalledTrx?.customerPriceGroup ??
      ""

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
    resetTransactionForm()
  }

  async function cancelRecall() {
    if (recalledTrx === undefined) return
    resetTransactionForm()
    toast.info(t("toasts.recallCancelled"))
  }

  function signalItem(index: number) {
    setItemSignal((prev) => ({ index, token: (prev?.token ?? 0) + 1 }))
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
            itemSignal={itemSignal}
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
          onReset={resetTransactionForm}
          onItemAdded={signalItem}
        />
      </div>

      <TransactionSummaryDialog
        form={form}
        open={getOpenSummary}
        onOpenChange={(v) => {
          if (!v) resetTransactionForm()
          setOpenSummary(v)
        }}
      />
    </div>
  )
}
