"use client"

import { ValtioContext } from "@/contexts/valtio-context"
import { type listItems } from "@/lib/crud/items"
import { createContext, ReactNode, useContext } from "react"
import { proxy, useSnapshot } from "valtio"

type ItemFilters = NonNullable<Parameters<typeof listItems>[0]>

export const itemFiltersCtx = createContext<
  ValtioContext<ItemFilters> | undefined
>(undefined)

export function ItemFiltersProvider({
  initialValue,
  children,
}: {
  initialValue: ItemFilters
  children: ReactNode
}) {
  const itemFiltersProxy = proxy(initialValue)
  const itemFiltersSnap = useSnapshot(itemFiltersProxy)

  return (
    <itemFiltersCtx.Provider
      value={{ snap: itemFiltersSnap, proxy: itemFiltersProxy }}
    >
      {children}
    </itemFiltersCtx.Provider>
  )
}

export function useItemFilters() {
  const { proxy: itemFiltersProxy, snap: itemFiltersSnap } =
    useContext(itemFiltersCtx)!
  return { itemFiltersProxy, itemFiltersSnap }
}
