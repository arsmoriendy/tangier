"use client"

import { StateContext } from "@/contexts/state-context"
import { type units } from "@/lib/db/schema"
import { createContext, ReactNode, useState } from "react"

type Units = (typeof units.$inferSelect)[]

export const unitsCtx = createContext<StateContext<Units> | undefined>(
  undefined
)

export function UnitsProvider({
  initialValue,
  children,
}: {
  initialValue: Units
  children: ReactNode
}) {
  const [units, setUnits] = useState(initialValue)

  return (
    <unitsCtx.Provider value={{ state: units, setState: setUnits }}>
      {children}
    </unitsCtx.Provider>
  )
}
