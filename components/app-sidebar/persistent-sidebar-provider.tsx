"use client"

import { ReactNode } from "react"
import { SidebarProvider } from "@/components/ui/sidebar"
import { useUserSettings } from "@/contexts/user-settings"

export function PersistentSidebarProvider({
  children,
}: {
  children: ReactNode
}) {
  const { getUserSettings, setUserSettings } = useUserSettings()

  return (
    <SidebarProvider
      open={!getUserSettings.collapseSidebar}
      onOpenChange={(open) => (setUserSettings.collapseSidebar = !open)}
    >
      {children}
    </SidebarProvider>
  )
}
