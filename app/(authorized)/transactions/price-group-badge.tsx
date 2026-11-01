"use client"

import { Badge } from "@/components/ui/badge"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Kbd } from "@/components/ui/kbd"
import { usePriceGroups } from "@/contexts/price-groups-ctx"
import { cn } from "@/lib/utils"
import { CaretDownIcon } from "@phosphor-icons/react"
import { useTranslations } from "next-intl"
import { useHotkeys } from "react-hotkeys-hook"

export function PriceGroupBadge({
  value,
  onChange,
  className,
}: {
  value?: string
  onChange: (id: string) => void
  className?: string
}) {
  const { priceGroups } = usePriceGroups()
  const t = useTranslations("transactions.form")

  const selected = priceGroups.find((pg) => pg.id === value)

  useHotkeys(
    priceGroups.slice(0, 9).map((_, i) => `ctrl+${i + 1}`),
    (e) => {
      const i = Number(e.key) - 1
      const pg = priceGroups[i]
      if (pg) onChange(pg.id)
    },
    {
      preventDefault: true,
      enableOnFormTags: true,
      enabled: priceGroups.length > 0,
    }
  )

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Badge asChild>
          <button type="button" className={cn("cursor-pointer", className)}>
            {selected && (
              <span
                className="size-2 shrink-0 rounded-full"
                style={{ backgroundColor: `#${selected.hexColor}` }}
              />
            )}
            <span>{selected?.name ?? t("customerGroup.title")}</span>
            <CaretDownIcon data-icon="inline-end" />
          </button>
        </Badge>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="start" className="w-max">
        <DropdownMenuLabel>{t("customerGroup.title")}</DropdownMenuLabel>
        <DropdownMenuRadioGroup value={value} onValueChange={onChange}>
          {priceGroups.map((pg, i) => (
            <DropdownMenuRadioItem key={pg.id} value={pg.id}>
              <span
                className="size-2 shrink-0 rounded-full"
                style={{ backgroundColor: `#${pg.hexColor}` }}
              />
              <span className="grow">{pg.name}</span>
              {i < 9 && <Kbd>{`Ctrl+${i + 1}`}</Kbd>}
            </DropdownMenuRadioItem>
          ))}
        </DropdownMenuRadioGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
