import { useAddItem } from "@/app/(authorized)/transactions/add-item-ctx"
import { defaultAddItemValues } from "@/app/(authorized)/transactions/add-item-schema"
import { SelectItemRows } from "@/app/(authorized)/transactions/select-item-rows"
import { Form, useAppForm, withForm } from "@/components/form"
import {
  Combobox,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxItem,
  ComboboxList,
} from "@/components/ui/combobox"
import { Combobox as ComboboxPrimitive } from "@base-ui/react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@/components/ui/dialog"
import { Kbd } from "@/components/ui/kbd"
import {
  Table,
  TableBody,
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
import { ComponentProps, RefObject, useState } from "react"
import TextField from "@/components/text-field"

const defaultProps: {
  afterSelect?: () => any
  nameRef?: RefObject<HTMLInputElement | null>
} = {}

export const SearchItemForm = withForm({
  defaultValues: defaultAddItemValues,
  props: defaultProps,
  render: function Render({ form: addItemForm, afterSelect, nameRef }) {
    const limit = 50
    const { addItemProxy } = useAddItem()
    const { units } = useUnits()
    const searchItemForm = useAppForm({
      onSubmit: async () => {
        const res = await readBarcode(addItemForm.state.values.name)
        if (res !== undefined) {
          selectItem(res.item)
          return
        }

        const items = await listItems({
          name: addItemForm.state.values.name,
          unitId: addItemForm.state.values.unitId,
          limit,
        })
        setFoundItems(items)
        setDialogOpened(true)
      },
    })

    const [foundItems, setFoundItems] = useState<ItemWithRelations[]>([])
    const [dialogIsOpen, setDialogOpened] = useState(false)

    const t = useTranslations("transactions.form.addItem.searchItem")
    const tc = useTranslations("common")

    function selectItem(item: ItemWithRelations) {
      const buyPrice = item.buyPrices.at(item.buyPrices.length - 1)

      addItemForm.setFieldValue("name", item.name)
      addItemForm.setFieldValue("unitId", item.unit.id)
      addItemForm.setFieldValue("buyPrice", buyPrice?.price ?? 0)
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
        <Form handleSubmit={searchItemForm.handleSubmit} className="contents">
          <addItemForm.AppField name="name">
            {(field) => (
              <field.TextField
                hideErrors
                className="min-w-50"
                ref={nameRef}
                hotkeys={["Ctrl+k", "F3"]}
                placeholder={t("nameOrBarcode")}
              />
            )}
          </addItemForm.AppField>

          <addItemForm.AppField name="unitId">
            {(field) => {
              const isInvalid = !field.state.meta.isValid
              return (
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
                      .find((unit) => unit.value === field.state.value) ?? null
                  }
                  itemToStringValue={(unit) => unit!.label ?? ""}
                  onValueChange={(
                    unit: { label: string; value: string } | null
                  ) => {
                    addItemForm.setFieldValue("unitId", unit?.value ?? "")
                  }}
                >
                  <ComboboxPrimitive.Input
                    render={(props) => (
                      <TextField
                        {...(props as ComponentProps<typeof TextField>)}
                        hideErrors
                        aria-invalid={isInvalid}
                        className="w-15 shrink-0"
                        placeholder={tc("unit")}
                      />
                    )}
                  />
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
              )
            }}
          </addItemForm.AppField>

          <searchItemForm.AppForm>
            <searchItemForm.SubmitButton size="icon">
              <MagnifyingGlassIcon />
            </searchItemForm.SubmitButton>
          </searchItemForm.AppForm>
        </Form>

        <Dialog open={dialogIsOpen} onOpenChange={setDialogOpened}>
          <DialogContent className="pt-0">
            <DialogTitle className="mt-4">
              {t("title")}{" "}
              <small className="text-muted-foreground">(max {limit})</small>
            </DialogTitle>

            <DialogDescription>
              {t.rich("description", { Kbd: (chunks) => <Kbd>{chunks}</Kbd> })}
            </DialogDescription>

            <Table className="block max-h-[64vh] border-separate border-spacing-0 overflow-y-auto [&_td]:border-b [&_th]:border-b [&_tr]:bg-popover [&_tr]:hover:bg-muted">
              <colgroup>
                <col className="w-full" />
                <col className="w-full" />
              </colgroup>

              <TableHeader className="sticky top-0">
                <TableRow>
                  <TableHead>{tc("name")}</TableHead>
                  <TableHead>{tc("unit")}</TableHead>
                </TableRow>
              </TableHeader>

              <TableBody>
                <SelectItemRows items={foundItems} onSelect={selectItem} />
              </TableBody>
            </Table>
          </DialogContent>
        </Dialog>
      </>
    )
  },
})
