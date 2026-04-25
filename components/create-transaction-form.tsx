import { Form, useAppForm } from "@/components/form"
import * as z from "zod"
import { MagnifyingGlassIcon, PlusIcon, TrashIcon } from "@phosphor-icons/react"
import { ItemWithRelations, searchItem } from "@/lib/crud/item"
import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import {
  RadioGroupChoiceCard,
  RadioGroupChoiceItem,
} from "@/components/ui/choice-card"
import { formatCurrency } from "@/lib/i18n/currency"
import { FieldLabel } from "@/components/ui/field"
import { useState } from "react"
import { createTransaction } from "@/lib/crud/transaction"

export default function CreateTransactionForm() {
  const createTransactionFormSchema = z.object({
    items: z
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
  })

  const defaultValues: z.infer<typeof createTransactionFormSchema> = {
    items: [],
    totalPrice: 0,
  }

  const form = useAppForm({
    defaultValues,
    validators: {
      onMount: createTransactionFormSchema,
      onChange: createTransactionFormSchema,
    },
    onSubmit: ({ value }) => {
      createTransaction(value)
    },
  })

  function recalculateTotalPrice() {
    form.setFieldValue(
      "totalPrice",
      form.state.values.items
        .map((i) => i.quantifiedPrice)
        .reduce((a, i) => a + i, 0)
    )
  }

  return (
    <div>
      <AddItemForm
        addItem={(item) => {
          form.setFieldValue("items", [...form.state.values.items, item])
        }}
      />

      <Form handleSubmit={form.handleSubmit}>
        <div className="flex items-end gap-1">
          <form.AppField name="totalPrice">
            {(field) => (
              <field.NumberField
                label="Total price"
                formatOptions={{
                  style: "currency",
                  currency: "IDR",
                }}
              />
            )}
          </form.AppField>
          <form.AppForm>
            <form.SubmitButton>Save and print</form.SubmitButton>
          </form.AppForm>
        </div>
        <form.AppField
          name="items"
          mode="array"
          listeners={{
            onChange: recalculateTotalPrice,
          }}
        >
          {({ state }) => (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableCell>Name</TableCell>
                  <TableCell>Unit price</TableCell>
                  <TableCell>Qty</TableCell>
                  <TableCell>Quantified price</TableCell>
                </TableRow>
              </TableHeader>
              <TableBody>
                {state.value.map((_, i) => (
                  <TableRow key={i}>
                    <TableCell>
                      <form.AppField name={`items[${i}].name`}>
                        {(field) => <field.TextField />}
                      </form.AppField>
                    </TableCell>
                    <TableCell>
                      <form.AppField
                        name={`items[${i}].unitPrice`}
                        listeners={{
                          onChange: ({ value }) => {
                            form.setFieldValue(
                              `items[${i}].quantifiedPrice`,
                              form.state.values.items[i].quantity * value
                            )
                          },
                        }}
                      >
                        {(field) => (
                          <field.NumberField
                            formatOptions={{
                              style: "currency",
                              currency: "IDR",
                            }}
                          />
                        )}
                      </form.AppField>
                    </TableCell>
                    <TableCell>
                      <form.AppField
                        name={`items[${i}].quantity`}
                        listeners={{
                          onChange: ({ value }) => {
                            form.setFieldValue(
                              `items[${i}].quantifiedPrice`,
                              form.state.values.items[i].unitPrice * value
                            )
                          },
                        }}
                      >
                        {(field) => <field.NumberField className="w-10" />}
                      </form.AppField>
                    </TableCell>
                    <TableCell>
                      <form.AppField
                        name={`items[${i}].quantifiedPrice`}
                        listeners={{
                          onChange: recalculateTotalPrice,
                        }}
                      >
                        {(field) => (
                          <field.NumberField
                            formatOptions={{
                              style: "currency",
                              currency: "IDR",
                            }}
                          />
                        )}
                      </form.AppField>
                    </TableCell>
                    <TableCell>
                      <Button
                        variant="destructive"
                        type="button"
                        size="icon"
                        onClick={() => {
                          form.removeFieldValue("items", i)
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
    </div>
  )
}

const addItemFormSchema = z.object({
  name: z.string().min(1),
  unitPrice: z.number().min(0),
  quantity: z.number().min(1),
  quantifiedPrice: z.number().min(0),
})

function AddItemForm(props: {
  addItem: (item: z.infer<typeof addItemFormSchema>) => any
}) {
  const defaultValues: z.infer<typeof addItemFormSchema> = {
    name: "",
    unitPrice: 0,
    quantity: 1,
    quantifiedPrice: 0,
  }

  const form = useAppForm({
    defaultValues,
    validators: { onMount: addItemFormSchema, onChange: addItemFormSchema },
    onSubmit: ({ value }) => {
      props.addItem(value)
      setPrices([])
      form.reset()
    },
  })

  const [prices, setPrices] = useState<{ price: number; priceGroup: string }[]>(
    []
  )

  async function handleSelectItem({ name, prices }: ItemWithRelations) {
    form.setFieldValue("name", name)
    prices.length > 0 && form.setFieldValue("unitPrice", prices[0].price)

    setPrices(
      prices.map((p) => ({
        price: p.price,
        priceGroup: p.priceGroup.name,
      }))
    )
  }

  return (
    <div>
      <div className="flex gap-2">
        <form.AppField
          name="quantity"
          listeners={{
            onChange: (v) =>
              form.setFieldValue(
                "quantifiedPrice",
                v.value * form.state.values.unitPrice
              ),
          }}
        >
          {(f) => <f.NumberField className="w-12" minValue={1} label="Qty" />}
        </form.AppField>
        <div className="grow">
          <FieldLabel className="mb-1">Search</FieldLabel>
          <SearchItemForm selectItem={handleSelectItem} />
        </div>
      </div>
      <Form handleSubmit={form.handleSubmit}>
        <form.AppField name="name">
          {(field) => <field.TextField label="Name" />}
        </form.AppField>
        <div className="flex gap-2">
          {prices.length > 0 && (
            <RadioGroupChoiceCard
              defaultValue={prices[0].price.toString()}
              onValueChange={(v) =>
                form.setFieldValue("unitPrice", parseFloat(v))
              }
            >
              {prices.map((p, i) => (
                <RadioGroupChoiceItem
                  key={i}
                  value={p.price.toString()}
                  title={formatCurrency(p.price)}
                  description={p.priceGroup}
                ></RadioGroupChoiceItem>
              ))}
            </RadioGroupChoiceCard>
          )}
          <form.AppField
            name="unitPrice"
            listeners={{
              onChange: (v) =>
                form.setFieldValue(
                  "quantifiedPrice",
                  v.value * form.state.values.quantity
                ),
            }}
          >
            {(field) => (
              <field.NumberField
                label="Unit price"
                formatOptions={{ style: "currency", currency: "IDR" }}
              />
            )}
          </form.AppField>
        </div>
        <form.AppField name="quantifiedPrice">
          {(field) => (
            <field.NumberField
              label="Quantified price"
              formatOptions={{ style: "currency", currency: "IDR" }}
            />
          )}
        </form.AppField>
        <form.AppForm>
          <form.SubmitButton>Add item</form.SubmitButton>
        </form.AppForm>
      </Form>
    </div>
  )
}

export function SearchItemForm(props: {
  selectItem: (item: ItemWithRelations) => any
}) {
  const searchItemFormSchema = z.object({ name: z.string().min(0) })

  const defaultValues: z.infer<typeof searchItemFormSchema> = { name: "" }

  const form = useAppForm({
    defaultValues,
    validators: {
      onMount: searchItemFormSchema,
      onChange: searchItemFormSchema,
    },
    onSubmit: ({ value: { name } }) => {
      searchItem({ name }).then((items) => {
        setFoundItems(items)
      })
    },
  })

  const [foundItems, setFoundItems] = useState<ItemWithRelations[]>([])

  return (
    <div>
      <Form handleSubmit={form.handleSubmit} className="flex gap-2">
        <form.AppField name="name">
          {(field) => <field.TextField />}
        </form.AppField>
        <form.AppForm>
          <form.SubmitButton size="icon">
            <MagnifyingGlassIcon />
          </form.SubmitButton>
        </form.AppForm>
      </Form>

      <Table>
        <TableBody>
          {foundItems.map((item, i) => (
            <TableRow key={i}>
              <TableCell>{item.name}</TableCell>
              <TableCell>
                <Button
                  size="icon"
                  onClick={() => {
                    form.setFieldValue("name", "")
                    setFoundItems([])
                    props.selectItem(item)
                  }}
                >
                  <PlusIcon />
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}
