"use client"

import { useTrx } from "@/app/(authorized)/transactions/history/trx-ctx"
import { Form, useAppForm } from "@/components/form"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { useEffect } from "react"
import { subscribe } from "valtio"

export function Report() {
  const { setTrx } = useTrx()

  const form = useAppForm({
    defaultValues: {
      revenue: 0,
      expenses: 0,
      profit: 0,
      trxCount: 0,
    },
  })

  function refresh() {
    const revenue = setTrx.reduce((acc, t) => acc + t.totalPrice, 0)
    const expenses = setTrx.reduce(
      (acc, t) =>
        acc + t.transactionItems.reduce((acc, i) => acc + i.buyPrice, 0),
      0
    )
    const profit = revenue - expenses
    const trxCount = setTrx.length

    form.setFieldValue("revenue", revenue)
    form.setFieldValue("expenses", expenses)
    form.setFieldValue("profit", profit)
    form.setFieldValue("trxCount", trxCount)
  }

  useEffect(() => {
    refresh()
    return subscribe(setTrx, refresh)
  }, [])

  const Revenue = () => (
    <form.AppField name="revenue">
      {(field) => (
        <field.IdrField label="Revenue" disabled inputClass="bg-warning/25" />
      )}
    </form.AppField>
  )

  const Expenses = () => (
    <form.AppField name="expenses">
      {(field) => (
        <field.IdrField
          label="Expenses"
          disabled
          inputClass="bg-destructive/25"
        />
      )}
    </form.AppField>
  )

  const Profit = () => (
    <form.AppField name="profit">
      {(field) => (
        <field.IdrField label="Profit" disabled inputClass="bg-success/25" />
      )}
    </form.AppField>
  )

  return (
    <Form
      handleSubmit={form.handleSubmit}
      className="grid grid-cols-2 items-end gap-2 space-y-0"
    >
      <Revenue />
      <Expenses />
      <Profit />

      <Dialog>
        <DialogTrigger asChild>
          <Button type="button">Details</Button>
        </DialogTrigger>
        <DialogContent>
          <DialogTitle>Sales Report</DialogTitle>

          <Revenue />
          <Expenses />
          <Profit />

          <form.AppField name="trxCount">
            {(field) => (
              <field.NumberField label="Transaction count" disabled />
            )}
          </form.AppField>
        </DialogContent>
      </Dialog>
    </Form>
  )
}
