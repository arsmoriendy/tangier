"use client"

import { StateContext } from "@/contexts/state-context"
import type { UserSettings } from "@/lib/crud/user-settings"
import { createContext, ReactNode, useContext, useState } from "react"

const userSettingsCtx = createContext<StateContext<UserSettings>>({
  state: {} as UserSettings,
  setState: () => {},
})

export function UserSettingsProvider(props: {
  children: ReactNode
  userSettings: UserSettings
}) {
  const [state, setState] = useState(props.userSettings)
  return (
    <userSettingsCtx.Provider value={{ state, setState }}>
      {props.children}
    </userSettingsCtx.Provider>
  )
}

export const useUserSettings = () => {
  const { state, setState } = useContext(userSettingsCtx)
  return { getUserSettings: state, setUserSettings: setState }
}
