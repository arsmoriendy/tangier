"use client"

import { ValtioContext } from "@/contexts/valtio-context"
import { TransactionWithRelations } from "@/lib/crud/transactions"
import { createContext, ReactNode, useContext } from "react"
import { proxy, useSnapshot } from "valtio"

const trxCtx = createContext<
  ValtioContext<TransactionWithRelations[]> | undefined
>(undefined)

export function TrxProvider({
  initialValue,
  children,
}: {
  initialValue: TransactionWithRelations[]
  children: ReactNode
}) {
  const setter = proxy(initialValue)
  const getter = useSnapshot(setter)

  return (
    <trxCtx.Provider value={{ proxy: setter, snap: getter }}>
      {children}
    </trxCtx.Provider>
  )
}

export function useTrx() {
  const { proxy, snap } = useContext(trxCtx)!
  return { setTrx: proxy, getTrx: snap }
}
