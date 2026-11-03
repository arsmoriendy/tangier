"use client"

import { TranslateIcon } from "@phosphor-icons/react"
import { useLocale, useTranslations } from "next-intl"
import { setLocale } from "@/lib/set-locale"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

const localeMap = { "id-ID": "Bahasa Indonesia", "en-ID": "English" }

type LanguageDropdownProps = {
  trigger?: React.ReactNode
  side?: React.ComponentProps<typeof DropdownMenuContent>["side"]
  align?: React.ComponentProps<typeof DropdownMenuContent>["align"]
  contentClassName?: string
}

export function LanguageDropdown({
  trigger,
  side = "right",
  align = "end",
  contentClassName,
}: LanguageDropdownProps) {
  const t = useTranslations("sidebar.language")
  const locale = useLocale()
  const localeLabel = localeMap[locale as keyof typeof localeMap] ?? locale

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        {trigger ?? (
          <Button variant="ghost" size="sm" aria-label={t("title")}>
            <TranslateIcon />
            {localeLabel}
          </Button>
        )}
      </DropdownMenuTrigger>

      <DropdownMenuContent
        side={side}
        align={align}
        className={contentClassName}
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
  )
}
