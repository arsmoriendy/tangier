"use client"

import { TranslateIcon } from "@phosphor-icons/react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu"
import { SidebarMenuButton, SidebarMenuItem } from "../ui/sidebar"
import { useLocale, useTranslations } from "next-intl"
import { setLocale } from "@/lib/set-locale"

export function LanguageSidebarItem() {
  const t = useTranslations("sidebar.language")
  const locale = useLocale()
  const localeMap = { "id-ID": "Bahasa Indonesia", "en-ID": "English" }

  return (
    <SidebarMenuItem>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <SidebarMenuButton>
            <TranslateIcon />
            {t("title")}
          </SidebarMenuButton>
        </DropdownMenuTrigger>

        <DropdownMenuContent
          side="right"
          align="end"
          className="relative left-2"
        >
          <DropdownMenuGroup>
            <DropdownMenuLabel>{t("header")}</DropdownMenuLabel>
            <DropdownMenuRadioGroup
              value={locale}
              onValueChange={(l) => setLocale(l)}
            >
              {Object.entries(localeMap).map(([value, label]) => (
                <DropdownMenuRadioItem key={value} value={value}>
                  {label}
                </DropdownMenuRadioItem>
              ))}
            </DropdownMenuRadioGroup>
          </DropdownMenuGroup>
        </DropdownMenuContent>
      </DropdownMenu>
    </SidebarMenuItem>
  )
}
