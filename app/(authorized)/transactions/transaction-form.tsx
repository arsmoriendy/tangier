"use client"

import { Form, useAppForm } from "@/components/form"
import {
  DotsSixVerticalIcon,
  PrinterIcon,
  TrashIcon,
} from "@phosphor-icons/react"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import {
  Field,
  FieldGroup,
  FieldLabel,
  FieldLegend,
  FieldSet,
} from "@/components/ui/field"
import {
  createTransaction,
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
import { Checkbox } from "@/components/ui/checkbox"
import { updateBuyPriceStock } from "@/lib/crud/buy-prices"
import { useLocalStorage } from "@/contexts/local-storage-ctx"
import { cn } from "@/lib/utils"
import { formatCurrency } from "@/lib/i18n/currency"
import { useSession } from "@/contexts/session-ctx"
import { toast } from "sonner"

export default function TransactionForm(props: {
  transaction?: DeepReadonly<TransactionWithRelations>
  onUpdate?: (trx: TransactionWithRelations) => any
}) {
  const session = useSession()
  const { getLocalStorage, setLocalStorage } = useLocalStorage()
  const form = useAppForm({
    defaultValues: props.transaction
      ? ({
          totalPrice: props.transaction.totalPrice,
          customerPriceGroup: props.transaction.customerPriceGroup,
          transactionItems: props.transaction.transactionItems.map((trx) => ({
            ...trx,
            extraFields: { quantifiedPrice: trx.sellPrice * trx.quantity },
          })),
        } satisfies typeof defaultTransactionValues)
      : defaultTransactionValues,
    validators: {
      onMount: transactionSchema,
      onChange: transactionSchema,
    },
    onSubmit: async ({ value: { transactionItems, ...value } }) => {
      const items = transactionItems.map(
        ({ extraFields, ...otherFields }) => otherFields
      )

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
      if (props.transaction !== undefined) {
        id = props.transaction.id
        createdAt = props.transaction.createdAt

        await updateTransaction({
          id: props.transaction.id,
          transactionItems: items,
          ...value,
        })

        toast.success("Transaction updated")
        props.onUpdate?.({ id, createdAt, transactionItems: items, ...value })
      } else {
        var { id, createdAt } = await createTransaction({
          transactionItems: items,
          ...value,
        })

        toast.success("Transaction created")
      }

      try {
        await printTransaction({
          id,
          createdAt,
          totalPrice: value.totalPrice,
          transactionItems: items,
          customerPriceGroup: value.customerPriceGroup,
        })
      } catch (e) {
        toast.error("Unable to print transaction", { description: `${e}` })
      }

      form.reset()
    },
  })

  function recalculateTotalPrice() {
    setIdempotentFieldValue(
      "totalPrice",
      form.state.values.transactionItems
        .map((i) => i.extraFields.quantifiedPrice)
        .reduce((a, i) => a + i, 0)
    )
  }

  function setIdempotentFieldValue<
    T extends Parameters<typeof form.setFieldValue>,
  >(field: T[0], value: T[1]) {
    const oldValue = form.getFieldValue(field)
    if (oldValue !== value)
      form.setFieldValue(
        field,
        // @ts-ignore
        value
      )
  }

  return (
    <div className="space-y-2">
      <AddItemProvider>
        <AddItemForm form={form} />
      </AddItemProvider>

      <FieldSet>
        <FieldLegend>Transaction details</FieldLegend>
        <FieldGroup>
          <Form handleSubmit={form.handleSubmit}>
            <div className="flex items-end gap-1">
              <form.AppField name="totalPrice">
                {(field) => <field.IdrField min={0} label="Total price" />}
              </form.AppField>
              <form.AppForm>
                <form.SubmitButton>
                  <PrinterIcon /> Save and print
                </form.SubmitButton>
              </form.AppForm>
            </div>
            <form.AppField
              name="transactionItems"
              mode="array"
              listeners={{
                onChange: recalculateTotalPrice,
              }}
            >
              {({ state }) => (
                <Table className="border-separate border-spacing-0">
                  <TableHeader>
                    <TableRow>
                      <TableHead />
                      <TableHead>Name</TableHead>
                      <TableHead>Unit</TableHead>
                      {session.user.role === "admin" && (
                        <TableHead>Buy price</TableHead>
                      )}
                      <TableHead>Sell price</TableHead>
                      <TableHead>Qty</TableHead>
                      <TableHead>
                        <label className="flex items-center gap-2">
                          <Checkbox
                            checked={getLocalStorage.decrementStock}
                            onCheckedChange={(c) => {
                              setLocalStorage.decrementStock = c as boolean
                              for (const [i, item] of state.value.entries()) {
                                if (item.buyPriceId !== null) {
                                  form.setFieldValue(
                                    `transactionItems[${i}].updateStock`,
                                    c as boolean
                                  )
                                }
                              }
                            }}
                          />
                          Update stock
                        </label>
                      </TableHead>
                      <TableHead>Quantified price</TableHead>
                      <TableHead />
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {state.value.map(({ buyPriceId }, i) => (
                      <TableRow
                        key={i}
                        draggable
                        onDragStart={(e) => {
                          e.dataTransfer.setData("text/plain", i.toString())
                          e.currentTarget.setAttribute("data-state", "selected")
                        }}
                        onDragEnd={(e) => {
                          e.currentTarget.removeAttribute("data-state")
                        }}
                        onDragOver={(e) => {
                          e.preventDefault()

                          const rect = e.currentTarget.getBoundingClientRect()
                          const y = e.clientY - rect.top
                          const yPct = y / rect.height

                          e.currentTarget.removeAttribute("data-drop")
                          e.currentTarget.setAttribute(
                            "data-drop",
                            yPct > 0.5 ? "bottom" : "top"
                          )
                        }}
                        onDragLeave={(e) => {
                          e.currentTarget.removeAttribute("data-drop")
                        }}
                        onDrop={(e) => {
                          const sourceIndex = parseInt(
                            e.dataTransfer.getData("text/plain")
                          )
                          const rect = e.currentTarget.getBoundingClientRect()
                          const y = e.clientY - rect.top
                          const yPct = y / rect.height

                          e.currentTarget.removeAttribute("data-drop")

                          form.moveFieldValues(
                            "transactionItems",
                            sourceIndex,
                            yPct > 0.5 ? i + 1 : i
                          )
                        }}
                        className="[&_td]:border-primary data-[drop=bottom]:[&_td]:border-b data-[drop=top]:[&_td]:border-t"
                      >
                        <TableCell className="cursor-grab align-top">
                          <DotsSixVerticalIcon className="h-8" />
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
                        {session.user.role === "admin" && (
                          <TableCell className="align-top">
                            <form.AppField
                              name={`transactionItems[${i}].buyPrice`}
                            >
                              {(field) => <field.IdrField min={0} />}
                            </form.AppField>
                          </TableCell>
                        )}
                        <TableCell className="align-top">
                          <form.AppField
                            name={`transactionItems[${i}].sellPrice`}
                            listeners={{
                              onChange: ({ value }) => {
                                setIdempotentFieldValue(
                                  `transactionItems[${i}].extraFields.quantifiedPrice`,
                                  form.state.values.transactionItems[i]
                                    .quantity * value
                                )
                              },
                            }}
                          >
                            {(field) => <field.IdrField min={0} />}
                          </form.AppField>
                          {session.user.role === "admin" && (
                            <form.Subscribe
                              selector={(f) => [
                                f.values.transactionItems[i].buyPrice,
                                f.values.transactionItems[i].sellPrice,
                              ]}
                            >
                              {([bp, sp]) => {
                                const margin = sp - bp
                                const discount = ((bp - sp) / bp) * 100
                                return (
                                  margin !== 0 && (
                                    <small
                                      className={cn(
                                        margin < 0
                                          ? "text-destructive"
                                          : "text-green-500"
                                      )}
                                    >
                                      Margin: {margin > 0 && "+"}
                                      {formatCurrency(margin)}{" "}
                                      {margin < 0 && (
                                        <>({discount.toFixed(2)}% discount)</>
                                      )}
                                    </small>
                                  )
                                )
                              }}
                            </form.Subscribe>
                          )}
                        </TableCell>
                        <TableCell className="align-top">
                          <form.AppField
                            name={`transactionItems[${i}].quantity`}
                            listeners={{
                              onChange: ({ value }) => {
                                setIdempotentFieldValue(
                                  `transactionItems[${i}].extraFields.quantifiedPrice`,
                                  form.state.values.transactionItems[i]
                                    .sellPrice * value
                                )
                              },
                            }}
                          >
                            {(field) => (
                              <field.NumberField min={1} className="w-10" />
                            )}
                          </form.AppField>
                        </TableCell>
                        <TableCell className="align-top">
                          {buyPriceId !== null ? (
                            <Field orientation="horizontal" className="h-8">
                              <form.AppField
                                name={`transactionItems[${i}].updateStock`}
                              >
                                {(f) => (
                                  <Checkbox
                                    checked={f.state.value}
                                    onCheckedChange={(c) =>
                                      f.setValue(c as boolean)
                                    }
                                  />
                                )}
                              </form.AppField>
                              <FieldLabel>Update stock</FieldLabel>
                            </Field>
                          ) : (
                            <Field orientation="horizontal" className="h-8">
                              <Checkbox disabled />
                              <FieldLabel>Custom stock</FieldLabel>
                            </Field>
                          )}
                        </TableCell>
                        <TableCell className="align-top">
                          <form.AppField
                            name={`transactionItems[${i}].extraFields.quantifiedPrice`}
                            listeners={{
                              onChange: ({ value }) => {
                                const newSellPrice =
                                  value /
                                  form.state.values.transactionItems[i].quantity

                                setIdempotentFieldValue(
                                  `transactionItems[${i}].sellPrice`,
                                  newSellPrice
                                )
                                recalculateTotalPrice()
                              },
                            }}
                          >
                            {(field) => <field.IdrField min={0} />}
                          </form.AppField>
                        </TableCell>
                        <TableCell className="align-top">
                          <Button
                            variant="destructive"
                            type="button"
                            size="icon"
                            onClick={() => {
                              form.removeFieldValue("transactionItems", i)
                              recalculateTotalPrice()
                            }}
                          >
                            <TrashIcon />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </form.AppField>
          </Form>
        </FieldGroup>
      </FieldSet>
    </div>
  )
}
