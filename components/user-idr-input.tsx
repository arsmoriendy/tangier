"use client"

import { IdrInput, IdrInputProps } from "@/components/ui/idr-input"
import { useUserSettings } from "@/contexts/user-settings"

export type UserIdrInputProps = Omit<IdrInputProps, "showDecimals">

export function UserIdrInput(props: UserIdrInputProps) {
  const { getUserSettings } = useUserSettings()

  return <IdrInput {...props} showDecimals={getUserSettings.showDecimals} />
}
