"use client"

import { ValtioContext } from "@/contexts/valtio-context"
import { createContext, ReactNode, useContext } from "react"
import { proxy, useSnapshot } from "valtio"

type Filters = { from: Date; to: Date }

const filtersCtx = createContext<ValtioContext<Filters> | undefined>(undefined)

export function FiltersProvider({
  initialValue,
  children,
}: {
  initialValue: Filters
  children: ReactNode
}) {
  const setter = proxy(initialValue)
  const getter = useSnapshot(setter)
  return (
    <filtersCtx.Provider value={{ snap: getter, proxy: setter }}>
      {children}
    </filtersCtx.Provider>
  )
}

export function useFilters() {
  const { proxy, snap } = useContext(filtersCtx)!
  return { setFilters: proxy, getFilters: snap }
}
