import { cn } from "@/lib/utils"
import type { IconProps } from "@phosphor-icons/react"
import { SpinnerIcon } from "@phosphor-icons/react/dist/ssr"

export function Spinner({ className, ...props }: IconProps) {
  return <SpinnerIcon className={cn("animate-spin", className)} {...props} />
}
