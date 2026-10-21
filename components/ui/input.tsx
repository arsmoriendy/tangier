import * as React from "react"

import { cn } from "@/lib/utils"

export const inputClass =
  "h-8 w-full min-w-0 rounded-none border border-input bg-transparent px-2.5 py-1 text-xs transition-colors outline-none file:inline-flex file:h-6 file:border-0 file:bg-transparent file:text-xs file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-1 focus-visible:ring-ring/50 disabled:pointer-events-none disabled:cursor-not-allowed disabled:bg-input/50 disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-1 aria-invalid:ring-destructive/20 md:text-xs dark:bg-input/30 dark:disabled:bg-input/80 dark:aria-invalid:border-destructive/50 dark:aria-invalid:ring-destructive/40"

type InputTransformer = (e: React.InputEvent<HTMLInputElement>) => void

export const upperCaseTransformer: InputTransformer = (e) => {
  const input = e.currentTarget
  const start = input.selectionStart
  const end = input.selectionEnd

  input.value = input.value.toUpperCase()
  input.setSelectionRange(start, end) // keep the cursor where it was
}

function Input({
  className,
  type,
  onInput,
  transformers,
  ...props
}: React.ComponentProps<"input"> & { transformers?: InputTransformer[] }) {
  return (
    <input
      type={type}
      data-slot="input"
      className={cn(inputClass, className)}
      onInput={(e) => {
        transformers?.forEach((t) => t(e))

        onInput?.(e) // propagate onInput prop
      }}
      {...props}
    />
  )
}

export { Input }
