import { useAddItem } from "@/app/(authorized)/transactions/new/add-item-ctx"
import { defaultAddItemValues } from "@/app/(authorized)/transactions/new/add-item-schema"
import { Form, useAppForm, withForm } from "@/components/form"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@/components/ui/dialog"
import { FieldLabel } from "@/components/ui/field"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { usePriceGroups } from "@/contexts/price-groups-ctx"
import { useUnits } from "@/contexts/units-ctx"
import { listItems } from "@/lib/crud/items"
import { ItemWithRelations } from "@/lib/crud/items"
import { formatCurrency } from "@/lib/i18n/currency"
import { MagnifyingGlassIcon } from "@phosphor-icons/react/dist/ssr"
import { useState } from "react"
import z from "zod"

const searchItemSchema = z.object({
  name: z.string().min(0),
  unitId: z.string().optional(),
})
const defaultSearchItemValues: z.infer<typeof searchItemSchema> = { name: "" }

export const SearchItemForm = withForm({
  defaultValues: defaultAddItemValues,
  render: function Render({ form }) {
    const { addItemProxy, addItemSnap } = useAddItem()
    const { units } = useUnits()
    const { priceGroups } = usePriceGroups()
    const searchItemForm = useAppForm({
      defaultValues: defaultSearchItemValues,
      validators: {
        onMount: searchItemSchema,
        onChange: searchItemSchema,
      },
      onSubmit: async ({ value }) => {
        const items = await listItems(value)
        setFoundItems(items)
        setDialogOpened(true)
      },
    })

    const [foundItems, setFoundItems] = useState<ItemWithRelations[]>([])
    const [dialogIsOpen, setDialogOpened] = useState(false)

    return (
      <Dialog open={dialogIsOpen} onOpenChange={setDialogOpened}>
        <Form handleSubmit={searchItemForm.handleSubmit}>
          <searchItemForm.AppForm>
            <FieldLabel>Name</FieldLabel>

            <div className="flex gap-2">
              <searchItemForm.AppField name="name">
                {(field) => (
                  <field.TextField tabIndex={2} id="search-item-name" />
                )}
              </searchItemForm.AppField>

              <searchItemForm.SubmitButton size="icon">
                <MagnifyingGlassIcon />
              </searchItemForm.SubmitButton>
            </div>

            <FieldLabel>Unit filter</FieldLabel>
            <div className="flex flex-wrap gap-2">
              <searchItemForm.Subscribe selector={(f) => f.values.unitId}>
                {(unit) =>
                  units.map((u, i) => (
                    <Badge
                      key={i}
                      className="select-none hover:bg-primary hover:text-primary-foreground"
                      variant={u.id === unit ? "default" : "outline"}
                      onClick={() => {
                        if (unit === u.id)
                          searchItemForm.setFieldValue("unitId", undefined)
                        else searchItemForm.setFieldValue("unitId", u.id)
                      }}
                    >
                      {u.name}
                    </Badge>
                  ))
                }
              </searchItemForm.Subscribe>
            </div>
          </searchItemForm.AppForm>
        </Form>

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
                <TableHead rowSpan={2}>Unit</TableHead>
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
                    form.setFieldValue("name", item.name)
                    form.setFieldValue("unit", item.unit.name)
                    form.setFieldValue(
                      "unitPrice",
                      item.sellPrices.find(
                        (p) =>
                          p.priceGroup.id === addItemSnap.selectedPriceGroupId
                      )?.price ?? 0
                    )
                    addItemProxy.sellPrices = item.sellPrices

                    searchItemForm.reset()
                    setFoundItems([])
                    setDialogOpened(false)
                  }}
                >
                  <TableCell>{item.name}</TableCell>
                  <TableCell>{item.unit.name}</TableCell>
                  {priceGroups.map((pg, i) => {
                    const price = item.sellPrices.find(
                      (p) => p.priceGroup.id === pg.id
                    )?.price

                    return (
                      <TableCell key={i}>
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
  },
})
