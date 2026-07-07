"use client"

import { useTrx } from "@/app/(authorized)/transactions/history/trx-ctx"
import { Form, useAppForm } from "@/components/form"
import { Button } from "@/components/ui/button"
import {
  Area,
  AreaChart,
  CartesianGrid,
  Label,
  Pie,
  PieChart,
  PieProps,
  XAxis,
} from "recharts"
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
  Chart,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart"
import { getRandomColor, getRandomColors } from "@/lib/catpuccun-colors"
import { useTranslations } from "next-intl"

export function Report() {
  const { setTrx } = useTrx()
  const t = useTranslations("transactions.history.report")

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
    timeline: z.record(z.string(), z.number()).default({}),
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
    const timeline = setTrx.reduce(
      (acc, t) => {
        const createdAt = new Date(t.createdAt)
        createdAt.setMinutes(0, 0, 0)
        const timestamp = createdAt.toLocaleString()
        acc[timestamp] = acc[timestamp] ? acc[timestamp] + 1 : 1
        return acc
      },
      {} as typeof defaultValues.timeline
    )

    form.setFieldValue("revenue", revenue)
    form.setFieldValue("expenses", expenses)
    form.setFieldValue("profit", profit)
    form.setFieldValue("trxCount", trxCount)
    form.setFieldValue("avgTrx", avgTrx)
    form.setFieldValue("userTrx", userTrx)
    form.setFieldValue("timeline", timeline)
  }

  useEffect(() => {
    refresh()
    return subscribe(setTrx, refresh)
  }, [])

  const Revenue = () => (
    <form.AppField name="revenue">
      {(field) => (
        <field.IdrField
          label={t("revenue")}
          disabled
          inputClass="bg-warning/25"
        />
      )}
    </form.AppField>
  )

  const Expenses = () => (
    <form.AppField name="expenses">
      {(field) => (
        <field.IdrField
          label={t("expenses")}
          disabled
          inputClass="bg-destructive/25"
        />
      )}
    </form.AppField>
  )

  const Profit = () => (
    <form.AppField name="profit">
      {(field) => (
        <field.IdrField
          label={t("profit")}
          disabled
          inputClass="bg-success/25"
        />
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
          <Button type="button">{t("details")}</Button>
        </DialogTrigger>
        <DialogContent className="max-h-[92vh] overflow-auto">
          <DialogTitle>{t("title")}</DialogTitle>

          <div className="flex gap-2">
            <Revenue />
            <Expenses />
          </div>
          <Profit />

          <div className="flex gap-2">
            <form.AppField name="trxCount">
              {(field) => <field.NumberField label={t("trxCount")} disabled />}
            </form.AppField>

            <form.AppField name="avgTrx">
              {(field) => (
                <field.IdrField
                  label={t("avgTrx")}
                  disabled
                  inputClass="bg-warning/25"
                />
              )}
            </form.AppField>
          </div>

          <form.Subscribe selector={(form) => form.values.userTrx}>
            {(userTrx) => {
              const users = Object.keys(userTrx)
              const entries = Object.entries(userTrx)

              if (users.length < 2) return undefined

              const colors = getRandomColors(users.length)
              const salesData = entries.map(([user, trx], i) => ({
                user,
                count: trx.trxCount,
                fill: "#" + colors[i],
              }))
              const revenueData = entries.map(([user, trx], i) => ({
                user,
                revenue: trx.revenue,
                fill: "#" + colors[i],
              }))
              const config = Object.fromEntries(
                entries.map(([user]) => [user, { label: user }])
              )

              const PieChartWrapper = ({
                data,
                label,
                dataKey,
              }: Pick<PieProps, "data"> & {
                label: string
                dataKey: string
              }) => (
                <Chart config={config}>
                  <PieChart
                    width="50%"
                    height={240}
                    margin={{ top: 0, right: 0, bottom: 0, left: 0 }}
                  >
                    <ChartTooltip
                      content={
                        <ChartTooltipContent
                          formatter={(_value, user) => user}
                        />
                      }
                    />
                    <Pie
                      label
                      stroke="0"
                      data={data}
                      nameKey="user"
                      dataKey={dataKey}
                      innerRadius={40}
                    >
                      <Label position="center">{label}</Label>
                    </Pie>
                  </PieChart>
                </Chart>
              )

              return (
                <div className="flex">
                  <PieChartWrapper
                    data={salesData}
                    dataKey="count"
                    label={t("sales")}
                  />
                  <PieChartWrapper
                    data={revenueData}
                    dataKey="revenue"
                    label={t("revenue")}
                  />
                </div>
              )
            }}
          </form.Subscribe>

          <form.Subscribe selector={(form) => form.values.timeline}>
            {(timeline) => {
              const timelineData = Object.entries(timeline).map(
                ([k, sales]) => ({
                  timestamp: k,
                  sales,
                })
              )
              const color = getRandomColor()
              return (
                <ChartContainer config={{ sales: { label: t("sales") } }}>
                  <AreaChart accessibilityLayer data={timelineData}>
                    <CartesianGrid vertical={false} />
                    <XAxis
                      dataKey="timestamp"
                      tickLine={false}
                      axisLine={false}
                      tickMargin={8}
                    />
                    <ChartTooltip
                      cursor={false}
                      content={<ChartTooltipContent indicator="line" />}
                    />
                    <Area
                      dataKey="sales"
                      type="natural"
                      fillOpacity={0.4}
                      fill={`#${color}`}
                      stroke={`#${color}`}
                    />
                  </AreaChart>
                </ChartContainer>
              )
            }}
          </form.Subscribe>
        </DialogContent>
      </Dialog>
    </Form>
  )
}
