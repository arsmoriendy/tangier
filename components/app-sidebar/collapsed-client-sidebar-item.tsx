"use client"

import { ClientDropdown } from "@/components/client-dropdown"
import { SidebarMenuButton, useSidebar } from "@/components/ui/sidebar"
import { XIcon } from "@phosphor-icons/react/dist/ssr"
import { isTauri } from "@tauri-apps/api/core"
import { useTranslations } from "next-intl"

export default function CollapsedClientSidebarItem() {
  const { state } = useSidebar()
  if (!isTauri || state !== "collapsed") return null

  const t = useTranslations("common.client")

  return (
    <ClientDropdown side="right" align="end">
      <SidebarMenuButton className="bg-destructive/10 text-destructive">
        <XIcon />
        {t("exit")}
      </SidebarMenuButton>
    </ClientDropdown>
  )
}
