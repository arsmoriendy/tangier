"use client"

import { ComponentProps, ReactNode } from "react"
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { formatCurrency } from "@/lib/i18n/currency"
import { marginAndDiscount } from "@/lib/margin"
import { cn } from "@/lib/utils"

export function MarginIndicator({
  sell,
  buy,
  tooltip,
  className,
  side = "bottom",
  align = "start",
  ...tooltipContentProps
}: {
  sell: number
  buy: number
  tooltip: ReactNode
  className?: string
} & Omit<ComponentProps<typeof TooltipContent>, "children" | "className">) {
  const { margin, discount } = marginAndDiscount(sell, buy)

  if (margin === 0) return null

  return (
    <Tooltip>
      <TooltipTrigger tabIndex={-1}>
        <small
          className={cn(
            margin < 0 ? "text-destructive" : "text-success",
            className
          )}
        >
          {margin > 0 && "+"}
          {formatCurrency(margin)} {margin < 0 && <>({discount.toFixed(2)}%)</>}
        </small>
      </TooltipTrigger>
      <TooltipContent side={side} align={align} {...tooltipContentProps}>
        {tooltip}
      </TooltipContent>
    </Tooltip>
  )
}
