import { cn } from "cn"
import { ComponentProps } from "react"

export function PageTitle({ className, ...props }: ComponentProps<"h1">) {
  return <h1 className={cn("font-bold", className)} {...props} />
}

export default function PageHeader({
  className,
  ...props
}: ComponentProps<"header">) {
  return (
    <header
      className={cn(
        "sticky top-0 z-10 flex items-center gap-2 border-b bg-background py-3 pl-4",
        className
      )}
      {...props}
    />
  )
}
