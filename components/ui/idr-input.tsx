import { NumberInputProps, NumberInput } from "@/components/ui/number-input"
import { cn } from "@/lib/utils"
import { RefObject, useRef } from "react"

export type IdrInputProps = Omit<
  NumberInputProps,
  | "decimalScale"
  | "fixedDecimalScale"
  | "decimalSeparator"
  | "thousandSeparator"
> & {
  inputClass?: string
  idrRef?: RefObject<HTMLDivElement | null>
  /** Show the trailing decimal part (e.g. `,00`). */
  showDecimals?: boolean
}

export function IdrInput({
  step = 500,
  showDecimals = true,
  className,
  disabled,
  "aria-disabled": ariaDisabled,
  "aria-invalid": ariaInvalid,
  inputClass,
  ref: inputRef,
  idrRef: ref = useRef<HTMLDivElement>(null),
  ...props
}: IdrInputProps) {
  return (
    <div
      ref={ref}
      aria-disabled={disabled ?? ariaDisabled}
      aria-invalid={ariaInvalid}
      className={cn(
        "flex h-8 w-full min-w-0 rounded-none border border-input bg-transparent transition-colors outline-none focus-within:border-ring focus-within:ring-1 focus-within:ring-ring/50 aria-disabled:pointer-events-none aria-disabled:cursor-not-allowed aria-disabled:bg-input/50 aria-disabled:opacity-50 aria-invalid:border-destructive-foreground aria-invalid:ring-1 aria-invalid:ring-destructive-foreground/20 md:text-xs dark:aria-disabled:bg-input/80 dark:aria-invalid:border-destructive-foreground/50 dark:aria-invalid:ring-destructive-foreground/40",
        className
      )}
    >
      <span
        className={cn(
          "hidden w-8 flex-none place-items-center bg-muted text-center text-muted-foreground select-none xl:grid",
          ariaInvalid ? "bg-destructive text-destructive-foreground" : ""
        )}
      >
        Rp
      </span>
      <NumberInput
        ref={inputRef}
        decimalScale={2}
        step={step}
        fixedDecimalScale={showDecimals}
        decimalSeparator=","
        thousandSeparator="."
        unstyled
        className={cn(
          "w-full min-w-0 rounded-none px-2.5 py-1 text-xs transition-colors outline-none placeholder:text-muted-foreground md:text-xs",
          inputClass
        )}
        {...props}
      />
    </div>
  )
}
