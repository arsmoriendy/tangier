"use client"

import { TranslateIcon } from "@phosphor-icons/react"
import { useTranslations } from "next-intl"
import { LanguageDropdown } from "@/components/language-dropdown"
import { SidebarMenuButton, SidebarMenuItem } from "../ui/sidebar"

export function LanguageSidebarItem() {
  const t = useTranslations("sidebar.language")

  return (
    <SidebarMenuItem>
      <LanguageDropdown
        trigger={
          <SidebarMenuButton>
            <TranslateIcon />
            {t("title")}
          </SidebarMenuButton>
        }
        contentClassName="relative left-2"
      />
    </SidebarMenuItem>
  )
}
