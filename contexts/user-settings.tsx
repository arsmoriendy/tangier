"use client"

import { createContext, ReactNode, useContext } from "react"
import { proxy, useSnapshot } from "valtio"
import { ValtioContext } from "./valtio-context"
import type { UserSettings } from "@/lib/crud/user-settings"

const userSettingsCtx = createContext<ValtioContext<UserSettings> | undefined>(
  undefined
)

export function UserSettingsProvider(props: {
  children: ReactNode
  userSettings: UserSettings
}) {
  const userSettingsProxy = proxy(props.userSettings)
  const userSettingsSnap = useSnapshot(userSettingsProxy)

  return (
    <userSettingsCtx.Provider
      value={{ proxy: userSettingsProxy, snap: userSettingsSnap }}
    >
      {props.children}
    </userSettingsCtx.Provider>
  )
}

export function useUserSettings() {
  const { proxy, snap } = useContext(userSettingsCtx)!
  return {
    setUserSettings: proxy,
    getUserSettings: snap,
  }
}
