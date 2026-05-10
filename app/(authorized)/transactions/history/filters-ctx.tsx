"use client"

import { ValtioContext } from "@/contexts/valtio-context"
import { type listTransactions } from "@/lib/crud/transactions"
import { createContext, ReactNode, useContext } from "react"
import { proxy, useSnapshot } from "valtio"

type Filters = NonNullable<Parameters<typeof listTransactions>[0]>

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
