import { Form, useAppForm } from "@/components/form"
import * as z from "zod"
import { MagnifyingGlassIcon, TrashIcon } from "@phosphor-icons/react"
import { ItemWithRelations, listItem } from "@/lib/crud/item"
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
  RadioGroupChoiceCard,
  RadioGroupChoiceItem,
} from "@/components/ui/choice-card"
import { formatCurrency } from "@/lib/i18n/currency"
import { FieldGroup, FieldLegend, FieldSet } from "@/components/ui/field"
import { useEffect, useState } from "react"
import { createTransaction } from "@/lib/crud/transaction"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@/components/ui/dialog"
import { priceGroups } from "@/lib/db/schema"
import { listPriceGroups } from "@/lib/crud/price-group"

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
    onSubmit: async ({ value }) => {
      await createTransaction(value)
      form.reset()
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
    <div className="space-y-2">
      <AddItemForm
        addItem={(item) => {
          form.setFieldValue("items", [...form.state.values.items, item])
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
                            {(field) => <field.IdrField min={0} />}
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
                            {(field) => (
                              <field.NumberField min={1} className="w-10" />
                            )}
                          </form.AppField>
                        </TableCell>
                        <TableCell>
                          <form.AppField
                            name={`items[${i}].quantifiedPrice`}
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
        </FieldGroup>
      </FieldSet>
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
      setPriceGroups([])
      form.reset()
    },
  })

  const [priceGroups, setPriceGroups] = useState<ItemWithRelations["prices"]>(
    []
  )
  const [selectedPriceGroupId, setSelectedPriceGroupId] = useState<string>()

  async function handleSelectItem(
    { name, prices }: ItemWithRelations,
    selectedPriceGroupId?: string
  ) {
    form.setFieldValue("name", name)
    form.setFieldValue(
      "unitPrice",
      prices.find((p) => p.priceGroup.id === selectedPriceGroupId)?.price ?? 0
    )

    setSelectedPriceGroupId(selectedPriceGroupId)
    setPriceGroups(prices)
  }

  return (
    <>
      <SearchItemForm selectItemPrice={handleSelectItem} />

      <FieldSet>
        <FieldLegend>Add item</FieldLegend>

        <Form handleSubmit={form.handleSubmit}>
          <div className="flex gap-2">
            <form.AppField name="name">
              {(field) => <field.TextField label="Name" />}
            </form.AppField>
          </div>

          {priceGroups.length === 0 ? (
            <span className="grid h-full min-h-14 place-items-center border border-dashed text-sm text-muted-foreground">
              No available price groups
            </span>
          ) : (
            <RadioGroupChoiceCard
              className="min-h-14 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5"
              value={selectedPriceGroupId}
              onValueChange={(v) => {
                setSelectedPriceGroupId(v)
                form.setFieldValue(
                  "unitPrice",
                  priceGroups.find((p) => p.priceGroup.id === v)!.price
                )
              }}
            >
              {priceGroups.map((p, i) => (
                <RadioGroupChoiceItem
                  className="bg-background"
                  key={i}
                  value={p.priceGroup.id}
                  title={formatCurrency(p.price)}
                  description={p.priceGroup.name}
                ></RadioGroupChoiceItem>
              ))}
            </RadioGroupChoiceCard>
          )}

          <div className="flex gap-2">
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
              {(field) => <field.IdrField min={0} label="Unit price" />}
            </form.AppField>
            <span className="mt-6 grid h-8 place-items-center">x</span>
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
              {(f) => (
                <f.NumberField
                  className="w-24"
                  min={1}
                  label="Qty"
                  tabIndex={1}
                />
              )}
            </form.AppField>
          </div>
          <form.AppField name="quantifiedPrice">
            {(field) => <field.IdrField label="Quantified price" min={0} />}
          </form.AppField>
          <form.AppForm>
            <form.SubmitButton>Add item</form.SubmitButton>
          </form.AppForm>
        </Form>
      </FieldSet>
    </>
  )
}

export function SearchItemForm(props: {
  selectItemPrice: (item: ItemWithRelations, priceGroup?: string) => any
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
      listItem({ name }).then((items) => {
        setFoundItems(items)
        setDialogOpened(true)
      })
    },
  })

  const [foundItems, setFoundItems] = useState<ItemWithRelations[]>([])
  const [dialogIsOpen, setDialogOpened] = useState(false)
  const [priceGroupsState, setPriceGroups] = useState<
    (typeof priceGroups.$inferSelect)[]
  >([])

  useEffect(() => {
    listPriceGroups().then(setPriceGroups)
  }, [])

  return (
    <Dialog open={dialogIsOpen} onOpenChange={setDialogOpened}>
      <FieldSet>
        <FieldLegend>Search item</FieldLegend>
        <Form handleSubmit={form.handleSubmit} className="flex gap-2">
          <form.AppField name="name">
            {(field) => <field.TextField tabIndex={2} />}
          </form.AppField>
          <form.AppForm>
            <form.SubmitButton size="icon">
              <MagnifyingGlassIcon />
            </form.SubmitButton>
          </form.AppForm>
        </Form>
      </FieldSet>

      <DialogContent>
        <DialogTitle>Select item</DialogTitle>
        <DialogDescription>
          Pick a price cell to add the corresponding item with the selected
          price
        </DialogDescription>

        <Table>
          <TableHeader>
            <TableRow>
              <TableHead rowSpan={2}>Name</TableHead>
              <TableHead colSpan={priceGroupsState.length}>Prices</TableHead>
            </TableRow>

            <TableRow>
              {priceGroupsState.map((pg, i) => (
                <TableHead key={i}>{pg.name}</TableHead>
              ))}
            </TableRow>
          </TableHeader>

          <TableBody>
            {foundItems.map((item, i) => (
              <TableRow key={i}>
                <TableCell>{item.name}</TableCell>
                {priceGroupsState.map((pg, i) => {
                  const price = item.prices.find(
                    (p) => p.priceGroup.id === pg.id
                  )?.price

                  return (
                    <TableCell
                      className="cursor-pointer hover:bg-primary hover:text-primary-foreground focus-visible:bg-primary focus-visible:text-primary-foreground"
                      key={i}
                      onClick={() => {
                        form.reset()
                        setFoundItems([])
                        setDialogOpened(false)
                        props.selectItemPrice(item, price ? pg.id : undefined)
                      }}
                    >
                      {formatCurrency(price ?? 0)}
                    </TableCell>
                  )
                })}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </DialogContent>
    </Dialog>
  )
}
