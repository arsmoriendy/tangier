"use client"

import { Form, useAppForm } from "@/components/form"
import { DotsSixVerticalIcon, TrashIcon } from "@phosphor-icons/react"
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

export default function TransactionForm(props: {
  transaction?: TransactionWithRelations
  onUpdate?: (trx: TransactionWithRelations) => any
  onDelete?: () => any
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
            extraFields: { quantifiedPrice: 0, link: undefined },
          })),
        } satisfies typeof defaultTransactionValues)
      : defaultTransactionValues,
    validators: {
      onMount: transactionSchema,
      onChange: transactionSchema,
    },
    onSubmit: async ({ value: { transactionItems, ...value } }) => {
      const items = transactionItems.map(({ extraFields, ...fields }) => fields)

      for (const item of transactionItems) {
        if (
          item.extraFields.link?.updateStock &&
          item.extraFields.link.originalBuyPrice !== undefined
        ) {
          await updateBuyPriceStock({
            itemId: item.extraFields.link.itemId,
            price: item.extraFields.link.originalBuyPrice,
            stockDelta: -item.quantity,
          })
        }
      }

      const { id, createdAt } = await createTransaction({
        transactionItems: items,
        ...value,
      })

      await printTransaction({
        id,
        createdAt,
        totalPrice: value.totalPrice,
        transactionItems: items,
        customerPriceGroup: value.customerPriceGroup,
      })

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
                <form.SubmitButton>Save and print</form.SubmitButton>
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
                <Table>
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
                        <Checkbox
                          checked={getLocalStorage.decrementStock}
                          onCheckedChange={(c) => {
                            setLocalStorage.decrementStock = c as boolean
                            for (const [i, item] of state.value.entries()) {
                              if (
                                item.extraFields.link &&
                                item.extraFields.link.originalBuyPrice !==
                                  undefined
                              ) {
                                form.setFieldValue(
                                  `transactionItems[${i}].extraFields.link.updateStock`,
                                  c as boolean
                                )
                              }
                            }
                          }}
                        />
                      </TableHead>
                      <TableHead>Quantified price</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {state.value.map(({ extraFields: { link } }, i) => (
                      <TableRow
                        key={i}
                        draggable
                        onDragStart={(e) => {
                          e.dataTransfer.setData("text/plain", i.toString())
                        }}
                        onDragOver={(e) => e.preventDefault()}
                        onDrop={(e) => {
                          const sourceIndex = parseInt(
                            e.dataTransfer.getData("text/plain")
                          )
                          form.swapFieldValues(
                            "transactionItems",
                            i,
                            sourceIndex
                          )
                        }}
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
                          {link && link.originalBuyPrice !== undefined ? (
                            <Field orientation="horizontal" className="h-8">
                              <form.AppField
                                name={`transactionItems[${i}].extraFields.link.updateStock`}
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
