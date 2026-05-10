"use client"

import { StateContext } from "@/contexts/state-context"
import { createContext, ReactNode, useContext, useState } from "react"

const itemCountCtx = createContext<StateContext<number> | undefined>(undefined)

export function ItemCountProvider({ children }: { children: ReactNode }) {
  const [itemCount, setItemCount] = useState(0)
  return (
    <itemCountCtx.Provider value={{ setState: setItemCount, state: itemCount }}>
      {children}
    </itemCountCtx.Provider>
  )
}

export function useItemCount() {
  const { state, setState } = useContext(itemCountCtx)!
  return { itemCount: state, setItemCount: setState }
}
