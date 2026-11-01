import { formatCurrency } from "@/lib/i18n/currency"
import { cn } from "@/lib/utils"

export function MismatchIndicator({
  mismatch,
  className,
}: {
  mismatch: number
  className?: string
}) {
  if (mismatch === 0) return null

  return (
    <small className={cn("text-warning", className)}>
      {mismatch > 0 && "+"}
      {formatCurrency(mismatch)}
    </small>
  )
}
