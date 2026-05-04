"use client"

import { ValtioContext } from "@/contexts/valtio-context"
import { ItemWithRelations } from "@/lib/crud/items"
import { createContext, ReactNode, useContext } from "react"
import { proxy, useSnapshot } from "valtio"

const defaultAddItemCtx: {
  sellPrices: ItemWithRelations["sellPrices"]
  selectedPriceGroupId?: string
} = {
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
