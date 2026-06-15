"use client"

import { Form, useAppForm } from "@/components/form"
import {
  ClockCountdownIcon,
  HandIcon,
  PrinterIcon,
  TrashIcon,
} from "@phosphor-icons/react"
import { FieldGroup, FieldLegend, FieldSet } from "@/components/ui/field"
import {
  createTransaction,
  listTransactions,
  TransactionWithRelations,
  updateTransaction,
} from "@/lib/crud/transactions"
import { printTransaction } from "@/lib/print-transaction"
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
import { useState } from "react"
import { usePriceGroups } from "@/contexts/price-groups-ctx"
import { ResetButton } from "@/components/reset-button"
import { useTranslations } from "next-intl"
import {
  RadioGroupChoiceCard,
  RadioGroupChoiceItem,
} from "@/components/ui/choice-card"
import { ButtonWithHotkeys } from "@/components/ui/button-with-hotkeys"
import { RecallDialog } from "@/app/(authorized)/transactions/recall-dialog"
import { TransactionItemTable } from "@/app/(authorized)/transactions/transaction-item-table"

export default function TransactionForm(props: {
  transaction?: DeepReadonly<TransactionWithRelations>
  onUpdate?: (trx: TransactionWithRelations) => any
}) {
  const session = useSession()
  const { priceGroups } = usePriceGroups()
  const { setHeld } = useHeld()
  const [openRecallDialog, setOpenRecallDialog] = useState(false)
  const [recalledTrx] = useState<TransactionWithRelations | undefined>(
    undefined
  )
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
            extraFields: { quantifiedPrice: trx.sellPrice * trx.quantity },
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
      const items = transactionItems.map(
        ({ extraFields, ...otherFields }) => otherFields
      )
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

        toast.success("Transaction updated")
        props.onUpdate?.({
          id,
          createdAt,
          ...trx,
        })
      } else {
        var { id, createdAt } = await createTransaction(trx)

        toast.success("Transaction created")
      }

      try {
        await printTransaction({
          id,
          createdAt,
          cashier: session.user.name,
          totalPrice: value.totalPrice,
          transactionItems: items,
          customerPriceGroup,
        })
      } catch (e) {
        toast.error("Unable to print transaction", { description: `${e}` })
      }

      form.reset()
    },
  })

  async function hold() {
    if (form.state.values.transactionItems.length < 1) return

    const { transactionItems, priceGroup, ...value } = form.state.values
    const items = transactionItems.map(
      ({ extraFields, ...otherFields }) => otherFields
    )
    const customerPriceGroup =
      priceGroups.find((pg) => pg.id === priceGroup)?.name ?? ""

    const trx = {
      transactionItems: items,
      cashier: session.user.name,
      customerPriceGroup,
      held: true,
      ...value,
    }

    var id: string
    var createdAt: string
    if (recalledTrx) {
      id = recalledTrx.id
      createdAt = recalledTrx.createdAt

      await updateTransaction({
        id,
        ...trx,
      })
    } else {
      var { id, createdAt } = await createTransaction(trx)
    }

    toast.success("Transaction held", { icon: <HandIcon /> })

    form.reset()
  }

  return (
    <div className="flex h-full flex-col gap-2">
      <FieldSet>
        <FieldLegend>{t("customerGroup.title")}</FieldLegend>

        <form.Subscribe selector={(f) => f.values.priceGroup}>
          {(priceGroup) => (
            <RadioGroupChoiceCard
              className="min-h-14 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5"
              value={priceGroup}
              onValueChange={(id) => form.setFieldValue("priceGroup", id)}
            >
              {priceGroups.map((pg, i) => (
                <RadioGroupChoiceItem
                  key={i}
                  style={{ backgroundColor: `#${pg.hexColor}` }}
                  value={pg.id}
                  title={pg.name}
                  description={
                    pg.description || t("customerGroup.noDescription")
                  }
                />
              ))}
            </RadioGroupChoiceCard>
          )}
        </form.Subscribe>
      </FieldSet>

      <AddItemProvider>
        <AddItemForm form={form} />
      </AddItemProvider>

      <div className="relative flex flex-1 flex-col gap-2">
        <FieldSet className="flex-1">
          <FieldLegend>{t("items.title")}</FieldLegend>
          <FieldGroup>
            <TransactionItemTable
              form={form}
              selected={selected}
              setSelected={setSelected}
            />
          </FieldGroup>
        </FieldSet>

        <div className="sticky bottom-0 flex gap-2 border bg-sidebar p-2 text-sidebar-foreground">
          <div className="flex h-8 items-center text-sm">
            <span>{tc("totalPrice")} :</span>
          </div>

          <form.AppField name="totalPrice">
            {(field) => <field.IdrField min={0} className="flex-1" />}
          </form.AppField>

          <ButtonWithHotkeys
            hotkeys={["Ctrl+d"]}
            variant="destructive"
            disabled={selected.size < 1}
            onClick={() => {
              for (const s of selected) {
                form.removeFieldValue("transactionItems", s)
              }
              setSelected(new Set())
            }}
          >
            <TrashIcon />
            {t("removeItems", { count: selected.size })}
          </ButtonWithHotkeys>

          <ResetButton
            hotkeys={["F4"]}
            onClick={() => {
              form.reset()
            }}
          />

          {!props.transaction && (
            <>
              <form.Subscribe selector={(form) => form.canSubmit}>
                {(canSubmit) => (
                  <ButtonWithHotkeys
                    type="button"
                    onClick={hold}
                    hotkeys={["F5"]}
                    disabled={!canSubmit}
                  >
                    <HandIcon /> Hold
                  </ButtonWithHotkeys>
                )}
              </form.Subscribe>

              <ButtonWithHotkeys
                type="button"
                hotkeys={["F6"]}
                onClick={async () => {
                  setHeld.splice(
                    0,
                    setHeld.length,
                    ...(await listTransactions({
                      held: true,
                      from: new Date(0),
                      to: new Date(),
                    }))
                  )
                  setOpenRecallDialog(true)
                }}
              >
                <ClockCountdownIcon />
                Recall
              </ButtonWithHotkeys>

              <RecallDialog
                form={form}
                open={openRecallDialog}
                setOpen={setOpenRecallDialog}
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
      </div>
    </div>
  )
}
