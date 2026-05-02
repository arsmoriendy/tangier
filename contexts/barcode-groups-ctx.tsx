"use client"

import { StateContext } from "@/contexts/state-context"
import { barcodeGroups } from "@/lib/db/schema"
import { createContext, ReactNode, useContext, useState } from "react"

type BarcodeGroups = (typeof barcodeGroups.$inferSelect)[]

const barcodeGroupCtx = createContext<StateContext<BarcodeGroups>>({
  state: [],
  setState: () => {},
})

export function BarcodeGroupsProvider(props: {
  children: ReactNode
  barcodeGroups: BarcodeGroups
}) {
  const [state, setState] = useState(props.barcodeGroups)
  return (
    <barcodeGroupCtx.Provider value={{ state, setState }}>
      {props.children}
    </barcodeGroupCtx.Provider>
  )
}

export const useBarcodeGroups = () => {
  const { state, setState } = useContext(barcodeGroupCtx)
  return { barcodeGroups: state, setBarcodeGroups: setState }
}
