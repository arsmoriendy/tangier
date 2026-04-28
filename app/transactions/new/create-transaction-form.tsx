import { Form, useAppForm } from "@/components/form"
import * as z from "zod"
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
import { FieldGroup, FieldLegend, FieldSet } from "@/components/ui/field"
import { createTransaction } from "@/lib/crud/transaction"
import { printTransaction } from "@/lib/print-transaction"
import { AddItemForm } from "@/app/transactions/new/add-item-form"

export default function CreateTransactionForm() {
  const createTransactionFormSchema = z.object({
    transactionItems: z
      .array(
        z.object({
          name: z.string().min(0),
          unitPrice: z.number().min(0),
          quantity: z.number().min(1),
          quantifiedPrice: z.number().min(0),
        })
      )
      .min(1),
    totalPrice: z.number().min(0),
    customerPriceGroup: z.string(),
  })

  const defaultValues: z.infer<typeof createTransactionFormSchema> = {
    transactionItems: [],
    totalPrice: 0,
    customerPriceGroup: "",
  }

  const form = useAppForm({
    defaultValues,
    validators: {
      onMount: createTransactionFormSchema,
      onChange: createTransactionFormSchema,
    },
    onSubmit: async ({ value }) => {
      const { id, createdAt } = await createTransaction({
        ...value,
      })
      await printTransaction({
        id,
        createdAt,
        totalPrice: value.totalPrice,
        transactionItems: value.transactionItems,
        customerPriceGroup: value.customerPriceGroup,
      })
      form.reset()
    },
  })

  function recalculateTotalPrice() {
    form.setFieldValue(
      "totalPrice",
      form.state.values.transactionItems
        .map((i) => i.quantifiedPrice)
        .reduce((a, i) => a + i, 0)
    )
  }

  return (
    <div className="space-y-2">
      <AddItemForm
        setSelectedPriceGroupName={(v) =>
          form.setFieldValue("customerPriceGroup", v)
        }
        addItem={(item) => {
          form.setFieldValue("transactionItems", [
            ...form.state.values.transactionItems,
            item,
          ])
        }}
      />

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
                      <TableHead>Unit price</TableHead>
                      <TableHead>Qty</TableHead>
                      <TableHead>Quantified price</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {state.value.map((_, i) => (
                      <TableRow key={i}>
                        <TableCell>
                          <form.AppField name={`transactionItems[${i}].name`}>
                            {(field) => <field.TextField />}
                          </form.AppField>
                        </TableCell>
                        <TableCell>
                          <form.AppField
                            name={`transactionItems[${i}].unitPrice`}
                            listeners={{
                              onChange: ({ value }) => {
                                form.setFieldValue(
                                  `transactionItems[${i}].quantifiedPrice`,
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
                                  `transactionItems[${i}].quantifiedPrice`,
                                  form.state.values.transactionItems[i]
                                    .unitPrice * value
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
                          <form.AppField
                            name={`transactionItems[${i}].quantifiedPrice`}
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
