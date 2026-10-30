"use client"

import { createContext, ReactNode, useContext, useEffect } from "react"
import { proxy, snapshot, subscribe, useSnapshot } from "valtio"
import { ValtioContext } from "./valtio-context"
import { upsertUserSettings, type UserSettings } from "@/lib/crud/user-settings"
import { useSession } from "@/contexts/session-ctx"
import { toast } from "sonner"
import { useTranslations } from "next-intl"

const userSettingsCtx = createContext<ValtioContext<UserSettings> | undefined>(
  undefined
)

export function UserSettingsProvider(props: {
  children: ReactNode
  userSettings: UserSettings
}) {
  const userSettingsProxy = proxy(props.userSettings)
  const userSettingsSnap = useSnapshot(userSettingsProxy)
  const { user } = useSession()
  const t = useTranslations("userSettings")

  let previousUserSettings = snapshot(userSettingsProxy)

  useEffect(() => {
    return subscribe(userSettingsProxy, async () => {
      const newUserSettings = snapshot(userSettingsProxy)

      const updatedUserSettings = Object.fromEntries(
        (Object.keys(newUserSettings) as (keyof typeof newUserSettings)[])
          .filter((k) => newUserSettings[k] !== previousUserSettings[k])
          .map((k) => [k, newUserSettings[k]])
      )

      if (Object.keys(updatedUserSettings).length > 0) {
        await upsertUserSettings({ userId: user.id, ...updatedUserSettings })

        for (const s in updatedUserSettings) {
          toast.success(t("updated"), {
            description: `${t(s as Parameters<typeof t>[0])} = ${JSON.stringify(updatedUserSettings[s])}`,
          })
        }
      }

      previousUserSettings = newUserSettings
    })
  }, [])

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
