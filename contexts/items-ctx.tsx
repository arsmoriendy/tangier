"use client"

import { ValtioContext } from "@/contexts/valtio-context"
import { ItemWithRelations } from "@/lib/crud/item"
import { createContext, ReactNode, useContext } from "react"
import { proxy, useSnapshot } from "valtio"

type Items = ItemWithRelations[]

const itemsCtx = createContext<ValtioContext<Items> | undefined>(undefined)

export function ItemsProvider(props: { children: ReactNode; items: Items }) {
  const itemsProxy = proxy(props.items)
  const itemsSnap = useSnapshot(itemsProxy)
  return (
    <itemsCtx.Provider value={{ proxy: itemsProxy, snap: itemsSnap }}>
      {props.children}
    </itemsCtx.Provider>
  )
}

export const useItems = () => {
  const { proxy, snap } = useContext(itemsCtx)!
  return { itemsSnap: snap, itemsProxy: proxy }
}
