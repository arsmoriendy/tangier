"use client"

import { ClientDropdown } from "@/components/client-dropdown"
import { SidebarMenuButton } from "@/components/ui/sidebar"
import { XIcon } from "@phosphor-icons/react/dist/ssr"
import { isTauri } from "@tauri-apps/api/core"
import { useTranslations } from "next-intl"

export default function CollapsedClientSidebarItem() {
  if (!isTauri()) return null

  const t = useTranslations("common.client")

  return (
    <ClientDropdown side="right" align="end">
      <SidebarMenuButton
        size="lg"
        className="h-8 bg-destructive/10 text-destructive"
      >
        <div className="grid aspect-square size-8 place-items-center">
          <XIcon />
        </div>
        {t("exit")}
      </SidebarMenuButton>
    </ClientDropdown>
  )
}
