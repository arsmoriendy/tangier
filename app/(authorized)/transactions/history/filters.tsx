"use client"

import { DatetimeRangeField } from "@/components/datetime-range-field"
import { useFilters } from "./filters-ctx"
import { fromDate } from "@internationalized/date"
import { Input } from "@/components/ui/input"
import { useTranslations } from "next-intl"
import { FieldLabel } from "@/components/ui/field"
import { useEffect, useState } from "react"

// the id input fires per keystroke, so wait for a pause before changing the
// query key
const ID_DEBOUNCE_MS = 200

export function Filters() {
  const t = useTranslations("transactions.history")
  const tc = useTranslations("common")
  const { getFilters, setFilters } = useFilters()
  const tz = Intl.DateTimeFormat().resolvedOptions().timeZone
  const [id, setId] = useState(getFilters.id)

  useEffect(() => {
    const timer = setTimeout(() => {
      setFilters.id = id
    }, ID_DEBOUNCE_MS)

    return () => {
      clearTimeout(timer)
    }
  }, [id, setFilters])

  return (
    <div className="space-y-2">
      <div className="space-y-2">
        <FieldLabel>{tc("id")}</FieldLabel>
        <Input value={id} onChange={(e) => setId(e.target.value)} />
      </div>

      <DatetimeRangeField
        label={t("filters.timeRange")}
        value={{
          start: fromDate(getFilters.from, tz),
          end: fromDate(getFilters.to, tz),
        }}
        onChange={async (v) => {
          if (!v) return

          setFilters.from = v.start.toDate()
          setFilters.to = v.end.toDate()
        }}
      />
    </div>
  )
}
