"use client"

import { ValtioContext } from "@/contexts/valtio-context"
import { createContext, ReactNode, useContext } from "react"
import { proxy, useSnapshot } from "valtio"
import { type TrxFilters } from "./trx-query"

const filtersCtx = createContext<ValtioContext<TrxFilters> | undefined>(
  undefined
)

export function FiltersProvider({
  initialValue,
  children,
}: {
  initialValue: TrxFilters
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
