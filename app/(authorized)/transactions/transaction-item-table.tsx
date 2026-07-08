import { defaultTransactionValues } from "@/app/(authorized)/transactions/transaction-schema"
import { withForm } from "@/components/form"
import { Checkbox } from "@/components/ui/checkbox"
import { Field } from "@/components/ui/field"
import {
  Table,
  TableBody,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { useLocalStorage } from "@/contexts/local-storage-ctx"
import { useSession } from "@/contexts/session-ctx"
import { formatCurrency } from "@/lib/i18n/currency"
import { cn } from "@/lib/utils"
import { DotsSixVerticalIcon } from "@phosphor-icons/react"
import { useTranslations } from "next-intl"

export const TransactionItemTable = withForm({
  defaultValues: defaultTransactionValues,
  props: {
    selected: new Set([0]),
    setSelected: (_selected: Set<number>) => {},
  },
  render: function Render({ form, selected, setSelected }) {
    const { getLocalStorage, setLocalStorage } = useLocalStorage()
    const t = useTranslations("transactions.form")
    const tc = useTranslations("common")
    const session = useSession()

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
      <form.AppField
        name="transactionItems"
        mode="array"
        listeners={{
          onChange: recalculateTotalPrice,
        }}
      >
        {({ state }) => (
          <Table className="w-full table-fixed border-separate border-spacing-0">
            {session.user.role === "admin" ? (
              <colgroup>
                <col className="w-1/36" />
                <col className="w-1/36" />
                <col className="w-9/36" />
                <col className="w-3/36" />
                <col className="w-6/36" />
                <col className="w-6/36" />
                <col className="w-3/36" />
                <col className="w-1/36" />
                <col className="w-6/36" />
              </colgroup>
            ) : (
              <colgroup>
                <col className="w-1/36" />
                <col className="w-1/36" />
                <col className="w-9/36" />
                <col className="w-3/36" />
                <col className="w-6/36" />
                <col className="w-3/36" />
                <col className="w-1/36" />
                <col className="w-6/36" />
              </colgroup>
            )}
            <TableHeader className="[&_th]:border-b">
              <TableRow>
                <TableHead></TableHead>
                <TableHead></TableHead>
                <TableHead>{tc("name")}</TableHead>
                <TableHead>{tc("unit")}</TableHead>
                {session.user.role === "admin" && (
                  <TableHead>{tc("buyPrice")}</TableHead>
                )}
                <TableHead>{tc("sellPrice")}</TableHead>
                <TableHead>Qty</TableHead>
                <TableHead />
                <TableHead>{tc("quantifiedPrice")}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {state.value.length < 1 && (
                <TableRow>
                  <TableCell
                    className="text-center text-muted-foreground"
                    colSpan={9}
                  >
                    {t("items.noItems")}
                  </TableCell>
                </TableRow>
              )}
              {state.value.map(({ buyPriceId }, i) => (
                <TableRow
                  key={i}
                  draggable
                  onDragStart={(e) => {
                    e.dataTransfer.setData("text/plain", i.toString())
                    e.currentTarget.setAttribute("data-state", "selected")
                  }}
                  onDragEnd={(e) => {
                    e.currentTarget.removeAttribute("data-state")
                  }}
                  onDragOver={(e) => {
                    e.preventDefault()

                    const rect = e.currentTarget.getBoundingClientRect()
                    const y = e.clientY - rect.top
                    const yPct = y / rect.height

                    e.currentTarget.removeAttribute("data-drop")
                    e.currentTarget.setAttribute(
                      "data-drop",
                      yPct > 0.5 ? "bottom" : "top"
                    )
                  }}
                  onDragLeave={(e) => {
                    e.currentTarget.removeAttribute("data-drop")
                  }}
                  onDrop={(e) => {
                    const sourceIndex = parseInt(
                      e.dataTransfer.getData("text/plain")
                    )
                    const rect = e.currentTarget.getBoundingClientRect()
                    const y = e.clientY - rect.top
                    const yPct = y / rect.height

                    e.currentTarget.removeAttribute("data-drop")

                    form.moveFieldValues(
                      "transactionItems",
                      sourceIndex,
                      yPct > 0.5 ? i + 1 : i
                    )
                  }}
                  className="[&_td]:border-primary data-[drop=bottom]:[&_td]:border-b data-[drop=top]:[&_td]:border-t"
                >
                  <TableCell className="cursor-grab align-top">
                    <DotsSixVerticalIcon className="inline h-8" />
                  </TableCell>
                  <TableCell className="flex justify-center px-0 align-top">
                    <Checkbox
                      checked={selected.has(i)}
                      className="my-2"
                      onCheckedChange={(checked) => {
                        const newSet = new Set(selected)
                        if (checked === true) newSet.add(i)
                        else newSet.delete(i)
                        setSelected(newSet)
                      }}
                    />
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
                      <form.AppField name={`transactionItems[${i}].buyPrice`}>
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
                            form.state.values.transactionItems[i].quantity *
                              value
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
                                {tc("margin")}: {margin > 0 && "+"}
                                {formatCurrency(margin)}{" "}
                                {margin < 0 && (
                                  <>
                                    (
                                    {tc("discountPerc", {
                                      perc: discount.toFixed(2),
                                    })}
                                    )
                                  </>
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
                            form.state.values.transactionItems[i].sellPrice *
                              value
                          )
                        },
                      }}
                    >
                      {(field) => <field.NumberField min={1} />}
                    </form.AppField>
                  </TableCell>
                  <TableCell className="px-0 align-top">
                    {buyPriceId !== null ? (
                      <Field
                        orientation="horizontal"
                        className="h-8 justify-center"
                      >
                        <form.AppField
                          name={`transactionItems[${i}].updateStock`}
                        >
                          {(f) => (
                            <Checkbox
                              checked={f.state.value}
                              onCheckedChange={(c) => f.setValue(c as boolean)}
                            />
                          )}
                        </form.AppField>
                      </Field>
                    ) : (
                      <Field orientation="horizontal" className="h-8">
                        <Checkbox disabled />
                      </Field>
                    )}
                  </TableCell>
                  <TableCell className="align-top">
                    <form.AppField
                      name={`transactionItems[${i}].extraFields.quantifiedPrice`}
                      listeners={{
                        onChange: () => {
                          recalculateTotalPrice()
                        },
                      }}
                    >
                      {(field) => <field.IdrField min={0} disabled />}
                    </form.AppField>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
            <TableFooter>
              <TableRow>
                <TableCell />
                <TableCell />
                <TableCell />
                <TableCell />
                <TableCell />
                {session.user.role === "admin" && <TableCell />}
                <TableCell />
                <TableCell className="flex justify-center gap-2 px-0">
                  <Checkbox
                    checked={getLocalStorage.decrementStock}
                    onCheckedChange={(c) => {
                      setLocalStorage.decrementStock = c as boolean
                      for (const [i, item] of state.value.entries()) {
                        if (item.buyPriceId !== null) {
                          form.setFieldValue(
                            `transactionItems[${i}].updateStock`,
                            c as boolean
                          )
                        }
                      }
                    }}
                  />
                </TableCell>
                <TableCell>
                  <span className="text-muted-foreground">
                    {t("items.updateStock")}
                  </span>
                </TableCell>
              </TableRow>
            </TableFooter>
          </Table>
        )}
      </form.AppField>
    )
  },
})
