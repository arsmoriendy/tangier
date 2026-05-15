"use client"

import { ValtioContext } from "@/contexts/valtio-context"
import { TransactionWithRelations } from "@/lib/crud/transactions"
import { createContext, ReactNode, useContext } from "react"
import { proxy, useSnapshot } from "valtio"

const heldCtx = createContext<
  ValtioContext<TransactionWithRelations[]> | undefined
>(undefined)

export function HeldProvider({
  initialValue,
  children,
}: {
  initialValue: TransactionWithRelations[]
  children: ReactNode
}) {
  const setHeld = proxy(initialValue)
  const getHeld = useSnapshot(setHeld)
  return (
    <heldCtx.Provider value={{ proxy: setHeld, snap: getHeld }}>
      {children}
    </heldCtx.Provider>
  )
}

export function useHeld() {
  const { proxy, snap } = useContext(heldCtx)!
  return { setHeld: proxy, getHeld: snap }
}
