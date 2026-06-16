"use client"

import { DatetimeRangeField } from "@/components/datetime-range-field"
import { useFilters } from "./filters-ctx"
import { fromDate } from "@internationalized/date"
import { useTrx } from "./trx-ctx"
import { listTransactions } from "@/lib/crud/transactions"
import { subscribe } from "valtio"
import { useEffect } from "react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useTranslations } from "next-intl"

export function Filters() {
  const t = useTranslations("transactions.history")
  const tc = useTranslations("common")
  const { getFilters, setFilters } = useFilters()
  const { setTrx } = useTrx()
  const tz = Intl.DateTimeFormat().resolvedOptions().timeZone

  useEffect(() => {
    return subscribe(setFilters, async () => {
      const newTrxList = await listTransactions(setFilters)
      setTrx.splice(0, setTrx.length, ...newTrxList)
    })
  }, [])

  const end = new Date()
  const start = new Date(end.getTime() - 3_600_000 * 3)

  return (
    <div className="space-y-2">
      <div className="flex-1 space-y-2">
        <Label>{tc("id")}</Label>
        <Input
          onChange={(v) => {
            setFilters.offset = 0
            setFilters.id = v.target.value
          }}
        />
      </div>
      <DatetimeRangeField
        className="flex-1"
        label={t("filters.timeRange")}
        value={{
          start: fromDate(getFilters.from ?? start, tz),
          end: fromDate(getFilters.to ?? end, tz),
        }}
        onChange={async (v) => {
          if (!v) return

          setFilters.offset = 0
          setFilters.from = v.start.toDate()
          setFilters.to = v.end.toDate()
        }}
      />
    </div>
  )
}
