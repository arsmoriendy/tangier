import { inputClass } from "@/components/ui/input"
import { cn } from "@/lib/utils"
import {
  RefObject,
  useEffect,
  useRef,
  type WheelEvent as ReactWheelEvent,
} from "react"
import { NumericFormat, NumericFormatProps } from "react-number-format"

export type NumberInputProps = Omit<
  NumericFormatProps,
  "defaultValue" | "step" | "min" | "max" | "value" | "onValueChange"
> & {
  defaultValue?: number
  step?: number
  min?: number
  max?: number
  unstyled?: true
  ref?: RefObject<HTMLInputElement | null>
  value: number
  onValueChange: (value: number) => any
  scrollable?: boolean
  arrowControls?: boolean
}

export function NumberInput({
  step = 1,
  min = -Infinity,
  max = Infinity,
  autoComplete = "off",
  className,
  onWheel,
  onKeyDown,
  onValueChange,
  onFocus,
  unstyled,
  value: valueProp,
  ref: refProp,
  scrollable = false,
  arrowControls = true,
  ...props
}: NumberInputProps) {
  const innerRef = useRef<HTMLInputElement>(null)
  const ref = refProp ?? innerRef
  const clamp = (v: number): number => Math.min(max, Math.max(min, v))

  useEffect(() => {
    if (!scrollable) return

    const input = ref.current
    if (!input) return

    function handleWheel(e: WheelEvent) {
      if (document.activeElement === input) {
        e.preventDefault()
        onValueChange(clamp(e.deltaY < 0 ? valueProp + step : valueProp - step))
      }
      onWheel?.(e as unknown as ReactWheelEvent<HTMLInputElement>)
    }

    input.addEventListener("wheel", handleWheel, { passive: false })
    return () => input.removeEventListener("wheel", handleWheel)
  })

  return (
    <NumericFormat
      getInputRef={ref}
      autoComplete={autoComplete}
      value={valueProp}
      className={!unstyled ? cn(inputClass, className) : className}
      min={min}
      max={max}
      onValueChange={({ floatValue }) => {
        if (floatValue !== undefined) onValueChange(floatValue)
      }}
      onKeyDown={(e) => {
        if (arrowControls) {
          if (e.key == "ArrowUp") {
            e.preventDefault()
            onValueChange(clamp(valueProp + step))
          }
          if (e.key == "ArrowDown") {
            e.preventDefault()
            onValueChange(clamp(valueProp - step))
          }
        }
        onKeyDown?.(e)
      }}
      onFocus={(e) => {
        e.currentTarget.select()
        onFocus?.(e)
      }}
      {...props}
    />
  )
}
