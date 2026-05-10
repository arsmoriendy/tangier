"use client"

import { Badge } from "@/components/ui/badge"
import { useUnits } from "@/contexts/units-ctx"
import { useItemFilters } from "./item-filters-ctx"

export function UnitFilter() {
  const { units } = useUnits()
  const { itemFiltersProxy, itemFiltersSnap } = useItemFilters()

  return (
    <div className="flex flex-wrap gap-2">
      {units.map((u, i) => (
        <Badge
          key={i}
          className="select-none"
          variant={u.id === itemFiltersSnap.unitId ? "default" : "outline"}
          onClick={() => {
            if (itemFiltersSnap.unitId === u.id)
              itemFiltersProxy.unitId = undefined
            else itemFiltersProxy.unitId = u.id
            itemFiltersProxy.offset = 0
          }}
        >
          {u.name}
        </Badge>
      ))}
    </div>
  )
}
