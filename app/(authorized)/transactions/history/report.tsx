"use client"

import { useTrx } from "@/app/(authorized)/transactions/history/trx-ctx"
import { Form, useAppForm } from "@/components/form"
import { Button } from "@/components/ui/button"
import { Pie, PieChart } from "recharts"
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { TransactionWithRelations } from "@/lib/crud/transactions"
import { useEffect } from "react"
import { subscribe } from "valtio"
import z from "zod"
import {
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart"
import { getRandomColors } from "@/lib/catpuccun-colors"

export function Report() {
  const { setTrx } = useTrx()

  const trxSchema = z.object({
    revenue: z.number().default(0),
    expenses: z.number().default(0),
    profit: z.number().default(0),
    trxCount: z.number().default(0),
    avgTrx: z.number().default(0),
  })

  const schema = z.object({
    ...trxSchema.shape,
    userTrx: z.record(z.string(), trxSchema).default({}),
  })

  const defaultValues = schema.parse({})

  const form = useAppForm({
    defaultValues,
  })

  function parseTrx(
    trx: TransactionWithRelations[]
  ): z.infer<typeof trxSchema> {
    const revenue = trx.reduce((acc, t) => acc + t.totalPrice, 0)
    const expenses = trx.reduce(
      (acc, t) =>
        acc + t.transactionItems.reduce((acc, i) => acc + i.buyPrice, 0),
      0
    )
    const profit = revenue - expenses
    const trxCount = trx.length
    const avgTrx = revenue / trxCount

    return { revenue, expenses, profit, trxCount, avgTrx }
  }

  function refresh() {
    const { revenue, expenses, profit, trxCount, avgTrx } = parseTrx(setTrx)
    const userTrx = [...new Set(setTrx.map((t) => t.cashier))].reduce(
      (acc, user) => {
        const trx = setTrx.filter((trx) => trx.cashier === user)
        acc[user] = parseTrx(trx)
        return acc
      },
      {} as typeof defaultValues.userTrx
    )

    form.setFieldValue("revenue", revenue)
    form.setFieldValue("expenses", expenses)
    form.setFieldValue("profit", profit)
    form.setFieldValue("trxCount", trxCount)
    form.setFieldValue("avgTrx", avgTrx)
    form.setFieldValue("userTrx", userTrx)
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

          <div className="flex gap-2">
            <form.AppField name="trxCount">
              {(field) => (
                <field.NumberField label="Transaction count" disabled />
              )}
            </form.AppField>

            <form.AppField name="avgTrx">
              {(field) => (
                <field.IdrField
                  label="Average transaction revenue"
                  disabled
                  inputClass="bg-warning/25"
                />
              )}
            </form.AppField>
          </div>

          <form.Subscribe selector={(form) => form.values.userTrx}>
            {(userTrx) => {
              const colors = getRandomColors(Object.keys(userTrx).length)
              const data = Object.entries(userTrx).map(([user, trx], i) => ({
                user,
                count: trx.trxCount,
                fill: "#" + colors[i],
              }))

              return (
                <ChartContainer
                  config={Object.fromEntries(
                    Object.entries(userTrx).map(([user]) => [
                      user,
                      { label: user },
                    ])
                  )}
                >
                  <PieChart>
                    <ChartTooltip content={<ChartTooltipContent hideLabel />} />
                    <Pie data={data} label nameKey="user" dataKey="count" />
                    <ChartLegend content={<ChartLegendContent />} />
                  </PieChart>
                </ChartContainer>
              )
            }}
          </form.Subscribe>
        </DialogContent>
      </Dialog>
    </Form>
  )
}
