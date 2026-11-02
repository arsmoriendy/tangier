import { useAddItem } from "@/app/(authorized)/transactions/add-item-ctx"
import { defaultAddItemValues } from "@/app/(authorized)/transactions/add-item-schema"
import { SelectItemRows } from "@/app/(authorized)/transactions/select-item-rows"
import { Form, useAppForm, withForm } from "@/components/form"
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
import { RefObject, useState } from "react"
import { WrappedCombobox } from "@/components/wrapped-combobox"
import { UserInput } from "@/components/user-input"

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
      addItemForm.setFieldValue("unit", item.unit.name)
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
                className="shrink-0 grow-1 basis-50"
                ref={nameRef}
                hotkeys={["Ctrl+k", "F3"]}
                placeholder={t("nameOrBarcode")}
              />
            )}
          </addItemForm.AppField>

          <addItemForm.Subscribe
            selector={(s) =>
              [
                s.values.unit,
                s.values.unitId,
                s.fieldMeta.unit?.isValid,
              ] as const
            }
          >
            {([unitName, unitId, unitIsValid]) => (
              <WrappedCombobox
                invalid={unitIsValid === false}
                options={units}
                option={units.find((unit) => unit.id === unitId) ?? null}
                onOptionChange={(unit) => {
                  addItemForm.setFieldValue("unitId", unit?.id)
                  addItemForm.setFieldValue("unit", unit?.name ?? "")
                }}
                optionToLabel={(unit) => unit.name}
                optionToValue={(unit) => unit.id}
                renderInput={({
                  domProps,
                  setInputValue,
                  invalid,
                  disabled,
                  ...props
                }) => (
                  <UserInput
                    onInput={(e) => setInputValue(e.currentTarget.value)}
                    disabled={disabled}
                    {...props}
                    {...domProps}
                    aria-invalid={invalid || undefined}
                  />
                )}
                input={unitName}
                onInputChange={(unitName) =>
                  addItemForm.setFieldValue("unit", unitName)
                }
                placeholder={tc("unit")}
                emptyMessage={t("errors.unitNotFound")}
                className="w-17 flex-none"
              />
            )}
          </addItemForm.Subscribe>

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
