import { useAddItem } from "@/app/(authorized)/transactions/add-item-ctx"
import { defaultAddItemValues } from "@/app/(authorized)/transactions/add-item-schema"
import { Form, useAppForm, withForm } from "@/components/form"
import {
  Combobox,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxInput,
  ComboboxItem,
  ComboboxList,
} from "@/components/ui/combobox"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@/components/ui/dialog"
import { FieldError, FieldLabel } from "@/components/ui/field"
import { Kbd } from "@/components/ui/kbd"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { useUnits } from "@/contexts/units-ctx"
import { readBarcode } from "@/lib/crud/barcodes"
import { listItems } from "@/lib/crud/items"
import { ItemWithRelations } from "@/lib/crud/items"
import { MagnifyingGlassIcon } from "@phosphor-icons/react/dist/ssr"
import { useTranslations } from "next-intl"
import { RefObject, useRef, useState } from "react"
import z from "zod"

const searchItemSchema = z.object({
  nameOrBarcode: z.string().min(0),
  unitId: z.string().optional(),
})
const defaultSearchItemValues: z.infer<typeof searchItemSchema> = {
  nameOrBarcode: "",
}
const defaultProps: {
  afterSelect?: () => any
  nameRef?: RefObject<HTMLInputElement | null>
} = {}

export const SearchItemForm = withForm({
  defaultValues: defaultAddItemValues,
  props: defaultProps,
  render: function Render({ form, afterSelect, nameRef }) {
    const { addItemProxy } = useAddItem()
    const { units } = useUnits()
    const searchItemForm = useAppForm({
      defaultValues: defaultSearchItemValues,
      validators: {
        onMount: searchItemSchema,
        onChange: searchItemSchema,
      },
      onSubmit: async ({ value }) => {
        const res = await readBarcode(value.nameOrBarcode)
        if (res !== undefined) {
          selectItem(res.item)
          return
        }

        const items = await listItems(value)
        setFoundItems(items)
        setDialogOpened(true)
      },
    })

    const [foundItems, setFoundItems] = useState<ItemWithRelations[]>([])
    const [dialogIsOpen, setDialogOpened] = useState(false)

    const t = useTranslations("transactions.form.addItem.searchItem")
    const tc = useTranslations("common")

    const itemsRef = useRef<HTMLTableRowElement[]>([])

    function selectItem(item: ItemWithRelations) {
      const buyPrice = item.buyPrices.at(item.buyPrices.length - 1)

      form.setFieldValue("name", item.name)
      form.setFieldValue("unit", item.unit.name)
      form.setFieldValue("buyPrice", buyPrice?.price ?? 0)
      addItemProxy.sellPrices = item.sellPrices
      addItemProxy.buyPrices = item.buyPrices
      addItemProxy.buyPrice = buyPrice

      searchItemForm.reset()
      setFoundItems([])
      setDialogOpened(false)
      afterSelect?.()
    }

    return (
      <>
        <Form handleSubmit={searchItemForm.handleSubmit} className="flex gap-2">
          <form.AppField name="name">
            {(field) => (
              <field.TextField
                label={t("nameOrBarcode")}
                ref={nameRef}
                hotkeys={["Ctrl+k", "F3"]}
                onChange={(e) => {
                  searchItemForm.setFieldValue(
                    "nameOrBarcode",
                    e.currentTarget.value
                  )
                }}
              />
            )}
          </form.AppField>

          <span className="mt-6 grid h-8 place-items-center">/</span>

          <form.AppField name="unit">
            {(field) => {
              const isInvalid = !field.state.meta.isValid
              return (
                <div className="space-y-2">
                  <FieldLabel aria-invalid={isInvalid}>{tc("unit")}</FieldLabel>
                  <Combobox
                    items={units.map((unit) => ({
                      value: unit.id,
                      label: unit.name,
                    }))}
                    value={
                      units
                        .map((unit) => ({
                          value: unit.id,
                          label: unit.name,
                        }))
                        .find((unit) => unit.label === field.state.value) ??
                      null
                    }
                    itemToStringValue={(unit) => unit!.label ?? ""}
                    onValueChange={(
                      unit: { label: string; value: string } | null
                    ) => {
                      form.setFieldValue("unit", unit?.label ?? "")
                      searchItemForm.setFieldValue("unitId", unit?.value)
                    }}
                  >
                    <ComboboxInput aria-invalid={isInvalid} />
                    <ComboboxContent>
                      <ComboboxEmpty>{t("errors.unitNotFound")}</ComboboxEmpty>
                      <ComboboxList>
                        {(unit) => (
                          <ComboboxItem key={unit.value} value={unit}>
                            {unit.label}
                          </ComboboxItem>
                        )}
                      </ComboboxList>
                    </ComboboxContent>
                  </Combobox>
                  {field.state.meta.errors[0] && (
                    <FieldError>
                      {
                        // @ts-ignore
                        field.state.meta.errors[0].message
                      }
                    </FieldError>
                  )}
                </div>
              )
            }}
          </form.AppField>

          <searchItemForm.AppForm>
            <searchItemForm.SubmitButton size="icon" className="mt-6">
              <MagnifyingGlassIcon />
            </searchItemForm.SubmitButton>
          </searchItemForm.AppForm>
        </Form>

        <Dialog open={dialogIsOpen} onOpenChange={setDialogOpened}>
          <DialogContent className="overflow-auto pt-0">
            <DialogTitle className="mt-4">{t("title")}</DialogTitle>

            <DialogDescription>
              {t.rich("description", { Kbd: (chunks) => <Kbd>{chunks}</Kbd> })}
            </DialogDescription>

            <Table className="border-separate border-spacing-0 [&_td]:border-b [&_th]:border-b [&_tr]:bg-popover [&_tr]:hover:bg-muted">
              <TableHeader className="sticky top-0">
                <TableRow>
                  <TableHead>{tc("name")}</TableHead>
                  <TableHead>{tc("unit")}</TableHead>
                </TableRow>
              </TableHeader>

              <TableBody>
                {foundItems.map((item, i) => (
                  <TableRow
                    key={i}
                    tabIndex={i + 1}
                    ref={(el) => {
                      el && (itemsRef.current[i] = el)
                    }}
                    role="button"
                    className="group cursor-pointer focus:outline-none [&_td]:group-hover:bg-primary [&_td]:group-hover:text-primary-foreground [&_td]:group-focus-visible:bg-primary [&_td]:group-focus-visible:text-primary-foreground"
                    onClick={() => selectItem(item)}
                    onKeyDown={(e) => {
                      if (e.key === "ArrowUp")
                        i !== 0 && itemsRef.current?.at(i - 1)?.focus()
                      else if (e.key === "ArrowDown")
                        itemsRef.current?.at(i + 1)?.focus()
                      else if (e.key === "Enter" || e.key === " ")
                        selectItem(item)
                      else return

                      e.preventDefault()
                    }}
                  >
                    <TableCell>{item.name}</TableCell>
                    <TableCell>{item.unit.name}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </DialogContent>
        </Dialog>
      </>
    )
  },
})
