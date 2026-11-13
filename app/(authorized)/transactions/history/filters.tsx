"use client"

import { DatetimeRangeField } from "@/components/datetime-range-field"
import { useFilters } from "./filters-ctx"
import { fromDate } from "@internationalized/date"
import { useTrx } from "./trx-ctx"
import { listTransactions } from "@/lib/crud/transactions"
import { subscribe } from "valtio"
import { useEffect } from "react"
import { Input } from "@/components/ui/input"
import { useTranslations } from "next-intl"
import { FieldLabel } from "@/components/ui/field"

// `offset` and the changed filter land as separate proxy mutations, and the id
// input fires per keystroke, so coalesce them into one refetch.
const REFETCH_DEBOUNCE_MS = 200

export function Filters() {
  const t = useTranslations("transactions.history")
  const tc = useTranslations("common")
  const { getFilters, setFilters } = useFilters()
  const { setTrx } = useTrx()
  const tz = Intl.DateTimeFormat().resolvedOptions().timeZone

  useEffect(() => {
    let seq = 0
    let timer: ReturnType<typeof setTimeout> | undefined

    const unsubscribe = subscribe(setFilters, () => {
      clearTimeout(timer)
      timer = setTimeout(async () => {
        const run = ++seq
        const newTrxList = await listTransactions(setFilters)
        // a newer filter change already asked for a fresher list
        if (run !== seq) return
        setTrx.splice(0, setTrx.length, ...newTrxList)
      }, REFETCH_DEBOUNCE_MS)
    })

    return () => {
      clearTimeout(timer)
      unsubscribe()
    }
  }, [])

  const end = new Date()
  const start = new Date(end.getTime() - 3_600_000 * 3)

  return (
    <div className="space-y-2">
      <div className="space-y-2">
        <FieldLabel>{tc("id")}</FieldLabel>
        <Input
          onChange={(v) => {
            setFilters.offset = 0
            setFilters.id = v.target.value
          }}
        />
      </div>

      <DatetimeRangeField
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
