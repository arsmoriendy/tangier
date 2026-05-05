"use client"

import { Form, useAppForm } from "@/components/form"
import { TrashIcon } from "@phosphor-icons/react"
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
import { createTransaction } from "@/lib/crud/transactions"
import { printTransaction } from "@/lib/print-transaction"
import { AddItemForm } from "@/app/(authorized)/transactions/new/add-item-form"
import { AddItemProvider } from "@/app/(authorized)/transactions/new/add-item-ctx"
import {
  createTransactionSchema,
  defaultCreateTransacionValues,
} from "@/app/(authorized)/transactions/new/create-transaction-schema"
import { Checkbox } from "@/components/ui/checkbox"
import { updateBuyPriceStock } from "@/lib/crud/buy-prices"

export default function CreateTransactionForm() {
  const form = useAppForm({
    defaultValues: defaultCreateTransacionValues,
    validators: {
      onMount: createTransactionSchema,
      onChange: createTransactionSchema,
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
    form.setFieldValue(
      "totalPrice",
      form.state.values.transactionItems
        .map((i) => i.extraFields.quantifiedPrice)
        .reduce((a, i) => a + i, 0)
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
                      <TableHead>Name</TableHead>
                      <TableHead>Unit</TableHead>
                      <TableHead>Buy price</TableHead>
                      <TableHead>Sell price</TableHead>
                      <TableHead>Qty</TableHead>
                      <TableHead>
                        <Checkbox
                          defaultChecked
                          onCheckedChange={(c) => {
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
                      <TableRow key={i}>
                        <TableCell>
                          <form.AppField name={`transactionItems[${i}].name`}>
                            {(field) => <field.TextField />}
                          </form.AppField>
                        </TableCell>
                        <TableCell>
                          <form.AppField name={`transactionItems[${i}].unit`}>
                            {(field) => <field.TextField />}
                          </form.AppField>
                        </TableCell>
                        <TableCell>
                          <form.AppField
                            name={`transactionItems[${i}].buyPrice`}
                          >
                            {(field) => <field.IdrField min={0} />}
                          </form.AppField>
                        </TableCell>
                        <TableCell>
                          <form.AppField
                            name={`transactionItems[${i}].sellPrice`}
                            listeners={{
                              onChange: ({ value }) => {
                                form.setFieldValue(
                                  `transactionItems[${i}].extraFields.quantifiedPrice`,
                                  form.state.values.transactionItems[i]
                                    .quantity * value
                                )
                              },
                            }}
                          >
                            {(field) => <field.IdrField min={0} />}
                          </form.AppField>
                        </TableCell>
                        <TableCell>
                          <form.AppField
                            name={`transactionItems[${i}].quantity`}
                            listeners={{
                              onChange: ({ value }) => {
                                form.setFieldValue(
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
                        <TableCell>
                          {link && link.originalBuyPrice !== undefined ? (
                            <Field orientation="horizontal">
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
                            <Field orientation="horizontal">
                              <Checkbox disabled />
                              <FieldLabel>Custom stock</FieldLabel>
                            </Field>
                          )}
                        </TableCell>
                        <TableCell>
                          <form.AppField
                            name={`transactionItems[${i}].extraFields.quantifiedPrice`}
                            listeners={{
                              onChange: recalculateTotalPrice,
                            }}
                          >
                            {(field) => <field.IdrField min={0} />}
                          </form.AppField>
                        </TableCell>
                        <TableCell>
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
