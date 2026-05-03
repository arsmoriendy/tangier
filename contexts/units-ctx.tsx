"use client"

import { StateContext } from "@/contexts/state-context"
import { units } from "@/lib/db/schema"
import { createContext, ReactNode, useContext, useState } from "react"

type Units = (typeof units.$inferSelect)[]

const unitsCtx = createContext<StateContext<Units>>({
  state: [],
  setState: () => {},
})

export function UnitsProvider(props: { children: ReactNode; units: Units }) {
  const [state, setState] = useState(props.units)
  return (
    <unitsCtx.Provider value={{ state, setState }}>
      {props.children}
    </unitsCtx.Provider>
  )
}

export const useUnits = () => {
  const { state, setState } = useContext(unitsCtx)
  return { units: state, setUnits: setState }
}
