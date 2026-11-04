"use client"

import { TranslateIcon } from "@phosphor-icons/react"
import { useTranslations } from "next-intl"
import { LanguageDropdown } from "@/components/language-dropdown"
import { SidebarMenuButton, SidebarMenuItem } from "../ui/sidebar"
import { useCollapsedTooltip } from "@/components/app-sidebar/use-collapsed-tooltip"

export function LanguageSidebarItem() {
  const t = useTranslations("sidebar.language")
  const tooltip = useCollapsedTooltip()

  return (
    <SidebarMenuItem>
      <LanguageDropdown
        trigger={
          <SidebarMenuButton tooltip={tooltip(t("title"))}>
            <TranslateIcon />
            {t("title")}
          </SidebarMenuButton>
        }
        contentClassName="relative left-2"
      />
    </SidebarMenuItem>
  )
}
