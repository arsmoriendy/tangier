"use client"

import { useTrx } from "@/app/(authorized)/transactions/history/trx-ctx"
import { Form, useAppForm } from "@/components/form"
import { Button } from "@/components/ui/button"
import { useEffect } from "react"
import { subscribe } from "valtio"

export function Report() {
  const { setTrx } = useTrx()

  const form = useAppForm({
    defaultValues: {
      revenue: 0,
      expenses: 0,
      profit: 0,
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

    form.setFieldValue("revenue", revenue)
    form.setFieldValue("expenses", expenses)
    form.setFieldValue("profit", profit)
  }

  useEffect(() => {
    refresh()
    return subscribe(setTrx, refresh)
  }, [])

  const Revenue = () => (
    <form.AppField name="revenue">
      {(field) => <field.IdrField label="Revenue" />}
    </form.AppField>
  )

  const Expenses = () => (
    <form.AppField name="expenses">
      {(field) => <field.IdrField label="Expenses" />}
    </form.AppField>
  )

  const Profit = () => (
    <form.AppField name="profit">
      {(field) => <field.IdrField label="Profit" />}
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
      <Button type="button">Details</Button>
    </Form>
  )
}
