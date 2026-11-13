"use client"

import { DatetimeRangeField } from "@/components/datetime-range-field"
import { useFilters } from "./filters-ctx"
import { fromDate } from "@internationalized/date"
import { useTxList } from "./trx-ctx"
import { listTransactions } from "@/lib/crud/transactions"
import { subscribe } from "valtio"
import { useEffect } from "react"
import { Input } from "@/components/ui/input"
import { useTranslations } from "next-intl"
import { FieldLabel } from "@/components/ui/field"
import { toast } from "sonner"

// `offset` and the changed filter land as separate proxy mutations, and the id
// input fires per keystroke, so coalesce them into one refetch.
const REFETCH_DEBOUNCE_MS = 200
const REFETCH_TOAST_ID = "history-refetch"

export function Filters() {
  const t = useTranslations("transactions.history")
  const tc = useTranslations("common")
  const { getFilters, setFilters } = useFilters()
  const { setTxList } = useTxList()
  const tz = Intl.DateTimeFormat().resolvedOptions().timeZone

  useEffect(() => {
    let seq = 0
    let timer: ReturnType<typeof setTimeout> | undefined

    const unsubscribe = subscribe(setFilters, () => {
      const run = ++seq
      clearTimeout(timer)
      timer = setTimeout(async () => {
        toast.loading(tc("loading"), { id: REFETCH_TOAST_ID })
        try {
          const newTrxList = await listTransactions(setFilters)
          // a newer filter change already asked for a fresher list
          if (run !== seq) return
          setTxList.splice(0, setTxList.length, ...newTrxList)
        } finally {
          // only the latest request may hide the toast
          if (run === seq) toast.dismiss(REFETCH_TOAST_ID)
        }
      }, REFETCH_DEBOUNCE_MS)
    })

    return () => {
      clearTimeout(timer)
      toast.dismiss(REFETCH_TOAST_ID)
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
