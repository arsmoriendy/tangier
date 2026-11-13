"use client"

import { ValtioContext } from "@/contexts/valtio-context"
import { TransactionWithRelations } from "@/lib/crud/transactions"
import { createContext, ReactNode, useContext } from "react"
import { proxy, useSnapshot } from "valtio"

const txListCtx = createContext<
  ValtioContext<TransactionWithRelations[]> | undefined
>(undefined)

export function TxListProvider({
  initialValue,
  children,
}: {
  initialValue: TransactionWithRelations[]
  children: ReactNode
}) {
  const setter = proxy(initialValue)
  const getter = useSnapshot(setter)

  return (
    <txListCtx.Provider value={{ proxy: setter, snap: getter }}>
      {children}
    </txListCtx.Provider>
  )
}

export function useTxList() {
  const { proxy, snap } = useContext(txListCtx)!
  return { setTxList: proxy, getTxList: snap }
}
