"use client"

import { ComponentProps, ReactNode } from "react"
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { formatCurrency } from "@/lib/i18n/currency"
import { cn } from "@/lib/utils"

export function MismatchIndicator({
  sellPrice,
  quantity,
  quantifiedSellPrice,
  tooltip,
  className,
  side = "bottom",
  align = "start",
  ...tooltipContentProps
}: {
  sellPrice: number
  quantity: number
  quantifiedSellPrice: number
  tooltip: ReactNode
  className?: string
} & Omit<ComponentProps<typeof TooltipContent>, "children" | "className">) {
  const computed = sellPrice * quantity
  const mismatch = quantifiedSellPrice - computed

  if (mismatch === 0) return null

  return (
    <Tooltip>
      <TooltipTrigger tabIndex={-1}>
        <small className={cn("text-warning", className)}>
          {mismatch > 0 && "+"}
          {formatCurrency(mismatch)}
        </small>
      </TooltipTrigger>
      <TooltipContent side={side} align={align} {...tooltipContentProps}>
        {tooltip}
      </TooltipContent>
    </Tooltip>
  )
}
