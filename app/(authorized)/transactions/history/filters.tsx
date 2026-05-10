"use client"

import { DatetimeRangeField } from "@/components/datetime-range-field"
import { useFilters } from "./filters-ctx"
import { fromDate } from "@internationalized/date"
import { useTrx } from "./trx-ctx"
import { listTransactions } from "@/lib/crud/transactions"
import { subscribe } from "valtio"
import { useEffect } from "react"

export function Filters() {
  const { getFilters, setFilters } = useFilters()
  const { setTrx } = useTrx()
  const tz = Intl.DateTimeFormat().resolvedOptions().timeZone

  useEffect(() => {
    return subscribe(setFilters, async () => {
      const newTrxList = await listTransactions(setFilters)
      setTrx.splice(0, setTrx.length, ...newTrxList)
    })
  })

  const end = new Date()
  const start = new Date(end.getTime() - 3_600_000 * 3)

  return (
    <div className="flex gap-2">
      <DatetimeRangeField
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
