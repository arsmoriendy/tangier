import { Form, useAppForm } from "@/components/form"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@/components/ui/dialog"
import { FieldLegend, FieldSet } from "@/components/ui/field"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { usePriceGroups } from "@/contexts/price-groups-ctx"
import { listItems } from "@/lib/crud/item"
import { ItemWithRelations } from "@/lib/crud/item"
import { formatCurrency } from "@/lib/i18n/currency"
import { MagnifyingGlassIcon } from "@phosphor-icons/react/dist/ssr"
import { useState } from "react"
import z from "zod"

export function SearchItemForm(props: {
  selectItemPrice: (item: ItemWithRelations) => any
}) {
  const { priceGroups } = usePriceGroups()
  const searchItemFormSchema = z.object({ name: z.string().min(0) })
  const defaultValues: z.infer<typeof searchItemFormSchema> = { name: "" }
  const form = useAppForm({
    defaultValues,
    validators: {
      onMount: searchItemFormSchema,
      onChange: searchItemFormSchema,
    },
    onSubmit: ({ value: { name } }) => {
      listItems({ name }).then((items) => {
        setFoundItems(items)
        setDialogOpened(true)
      })
    },
  })

  const [foundItems, setFoundItems] = useState<ItemWithRelations[]>([])
  const [dialogIsOpen, setDialogOpened] = useState(false)

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

      <DialogContent className="max-h-[92vh] w-[92vw] overflow-auto pt-0 sm:max-w-[92vw]">
        <DialogTitle className="mt-4">Select item</DialogTitle>
        <DialogDescription>
          Pick a price cell to add the corresponding item with the selected
          price
        </DialogDescription>

        <Table className="border-separate border-spacing-0 [&_td]:border-b [&_th]:border-b [&_tr]:bg-popover [&_tr]:hover:bg-muted">
          <TableHeader className="sticky top-0">
            <TableRow>
              <TableHead rowSpan={2}>Name</TableHead>
              <TableHead colSpan={priceGroups.length}>Prices</TableHead>
            </TableRow>

            <TableRow>
              {priceGroups.map((pg, i) => (
                <TableHead key={i}>{pg.name}</TableHead>
              ))}
            </TableRow>
          </TableHeader>

          <TableBody>
            {foundItems.map((item, i) => (
              <TableRow
                key={i}
                className="group cursor-pointer [&_td]:group-hover:bg-primary [&_td]:group-hover:text-primary-foreground [&_td]:group-focus-visible:bg-primary [&_td]:group-focus-visible:text-primary-foreground"
                onClick={() => {
                  form.reset()
                  setFoundItems([])
                  setDialogOpened(false)
                  props.selectItemPrice(item)
                }}
              >
                <TableCell>{item.name}</TableCell>
                {priceGroups.map((pg, i) => {
                  const price = item.prices.find(
                    (p) => p.priceGroup.id === pg.id
                  )?.price

                  return (
                    <TableCell key={i}>{formatCurrency(price ?? 0)}</TableCell>
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
