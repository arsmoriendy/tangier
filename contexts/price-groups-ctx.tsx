"use client"

import { StateContext } from "@/contexts/state-context"
import { priceGroups } from "@/lib/db/schema"
import { createContext, ReactNode, useContext, useState } from "react"

type PriceGroups = (typeof priceGroups.$inferSelect)[]

const priceGroupCtx = createContext<StateContext<PriceGroups>>({
  state: [],
  setState: () => {},
})

export function PriceGroupsProvider(props: {
  children: ReactNode
  priceGroups: PriceGroups
}) {
  const [state, setState] = useState(props.priceGroups)
  return (
    <priceGroupCtx.Provider value={{ state, setState }}>
      {props.children}
    </priceGroupCtx.Provider>
  )
}

export const usePriceGroups = () => {
  const { state, setState } = useContext(priceGroupCtx)
  return { priceGroups: state, setPriceGroups: setState }
}
