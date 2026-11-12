"use client"

import { ClientDropdown } from "@/components/client-dropdown"
import { SidebarMenuButton } from "@/components/ui/sidebar"
import { XIcon } from "@phosphor-icons/react/dist/ssr"
import { isTauri } from "@tauri-apps/api/core"
import { useTranslations } from "next-intl"
import { useCollapsedTooltip } from "@/components/app-sidebar/use-collapsed-tooltip"

export default function CollapsedClientSidebarItem() {
  const t = useTranslations("common.client")
  const tooltip = useCollapsedTooltip()

  if (!isTauri()) return null

  return (
    <ClientDropdown side="right" align="end">
      <SidebarMenuButton
        size="lg"
        tooltip={tooltip(t("exit"))}
        className="h-8 bg-destructive text-destructive-foreground"
      >
        <div className="grid aspect-square size-8 place-items-center">
          <XIcon />
        </div>
        {t("exit")}
      </SidebarMenuButton>
    </ClientDropdown>
  )
}
