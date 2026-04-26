import { NumberInputProps, NumberInput } from "@/components/ui/number-input"
import { cn } from "@/lib/utils"

export type IdrInputProps = Omit<
  NumberInputProps,
  | "decimalScale"
  | "fixedDecimalScale"
  | "decimalSeparator"
  | "thousandSeparator"
>

export function IdrInput({
  step = 500,
  className,
  disabled,
  "aria-disabled": ariaDisabled,
  "aria-invalid": ariaInvalid,
  ...props
}: IdrInputProps) {
  return (
    <div
      aria-disabled={disabled ?? ariaDisabled}
      aria-invalid={ariaInvalid}
      className={cn(
        className,
        "flex w-full min-w-0 rounded-none border border-input bg-transparent transition-colors outline-none focus-within:border-ring focus-within:ring-1 focus-within:ring-ring/50 aria-disabled:pointer-events-none aria-disabled:cursor-not-allowed aria-disabled:bg-input/50 aria-disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-1 aria-invalid:ring-destructive/20 md:text-xs dark:bg-input/30 dark:aria-disabled:bg-input/80 dark:aria-invalid:border-destructive/50 dark:aria-invalid:ring-destructive/40"
      )}
    >
      <span
        className={cn(
          "bg-muted p-2 text-muted-foreground select-none",
          ariaInvalid ? "bg-destructive text-background" : ""
        )}
      >
        Rp
      </span>
      <NumberInput
        decimalScale={2}
        step={step}
        fixedDecimalScale
        decimalSeparator=","
        thousandSeparator="."
        unstyled
        className="h-8 w-full min-w-0 rounded-none px-2.5 py-1 text-xs transition-colors outline-none placeholder:text-muted-foreground md:text-xs"
        {...props}
      />
    </div>
  )
}
