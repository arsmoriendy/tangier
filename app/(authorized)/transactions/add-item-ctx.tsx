"use client"

import { ValtioContext } from "@/contexts/valtio-context"
import { ItemWithRelations } from "@/lib/crud/items"
import { type buyPrices } from "@/lib/db/schema"
import { createContext, ReactNode, useContext } from "react"
import { proxy, useSnapshot } from "valtio"

const defaultAddItemCtx: {
  buyPrices: ItemWithRelations["buyPrices"]
  sellPrices: ItemWithRelations["sellPrices"]
  selectedSellPriceId?: string
  buyPrice?: Omit<typeof buyPrices.$inferSelect, "item">
} = {
  buyPrices: [],
  sellPrices: [],
}

const addItemCtx = createContext<
  ValtioContext<typeof defaultAddItemCtx> | undefined
>(undefined)

export function AddItemProvider(props: {
  children: ReactNode
  value?: typeof defaultAddItemCtx
}) {
  const addItemProxy = proxy(props.value ?? defaultAddItemCtx)
  const addItemSnap = useSnapshot(addItemProxy)

  return (
    <addItemCtx.Provider value={{ proxy: addItemProxy, snap: addItemSnap }}>
      {props.children}
    </addItemCtx.Provider>
  )
}

export function useAddItem() {
  const { proxy: addItemProxy, snap: addItemSnap } = useContext(addItemCtx)!
  return { addItemProxy, addItemSnap }
}
