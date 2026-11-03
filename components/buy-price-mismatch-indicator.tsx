"use client"

import { ComponentProps, ReactNode } from "react"
import { WarningIcon } from "@phosphor-icons/react"
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { cn } from "@/lib/utils"

export function BuyPriceMismatchIndicator({
  buyPrice,
  originalBuyPrice,
  tooltip,
  className,
  side = "bottom",
  align = "start",
  ...tooltipContentProps
}: {
  buyPrice: number
  originalBuyPrice: number | null | undefined
  tooltip: ReactNode
  className?: string
} & Omit<ComponentProps<typeof TooltipContent>, "children" | "className">) {
  if (originalBuyPrice === null || originalBuyPrice === undefined) return null
  if (buyPrice === originalBuyPrice) return null

  return (
    <Tooltip>
      <TooltipTrigger tabIndex={-1} className={cn("text-warning", className)}>
        <WarningIcon weight="fill" />
      </TooltipTrigger>
      <TooltipContent side={side} align={align} {...tooltipContentProps}>
        {tooltip}
      </TooltipContent>
    </Tooltip>
  )
}
