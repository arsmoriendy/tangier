"use client"

import { DatetimeRangeField } from "@/components/datetime-range-field"
import { useFilters } from "./filters-ctx"
import { fromDate } from "@internationalized/date"
import { useTrx } from "./trx-ctx"
import { listTransactions } from "@/lib/crud/transactions"

export function Filters() {
  const { getFilters, setFilters } = useFilters()
  const { setTrx } = useTrx()
  const tz = Intl.DateTimeFormat().resolvedOptions().timeZone
  return (
    <div className="flex gap-2">
      <DatetimeRangeField
        value={{
          start: fromDate(getFilters.from, tz),
          end: fromDate(getFilters.to, tz),
        }}
        onChange={async (v) => {
          if (!v) return

          setFilters.from = v.start.toDate()
          setFilters.to = v.end.toDate()

          const newTrxList = await listTransactions({
            from: setFilters.from,
            to: setFilters.to,
          })
          setTrx.splice(0, setTrx.length, ...newTrxList)
        }}
      />
    </div>
  )
}
