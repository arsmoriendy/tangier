import { formatCurrency } from "@/lib/i18n/currency"
import { cn } from "@/lib/utils"

export function MarginIndicator({
  margin,
  discount,
  className,
}: {
  margin: number
  discount: number
  className?: string
}) {
  if (margin === 0) return null

  return (
    <small
      className={cn(
        margin < 0 ? "text-destructive" : "text-success",
        className
      )}
    >
      {margin > 0 && "+"}
      {formatCurrency(margin)} {margin < 0 && <>({discount.toFixed(2)}%)</>}
    </small>
  )
}
