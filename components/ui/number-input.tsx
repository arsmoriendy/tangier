import { inputClass } from "@/components/ui/input"
import { cn } from "@/lib/utils"
import { useEffect, useRef } from "react"
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
  value: number
  onValueChange: (value: number) => any
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
  unstyled,
  value: valueProp,
  ...props
}: NumberInputProps) {
  const clamp = (v: number): number => Math.min(max, Math.max(min, v))
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    function handleWheel(e: WheelEvent) {
      if (document.activeElement === inputRef.current) {
        e.preventDefault()
        onValueChange(clamp(e.deltaY < 0 ? valueProp + step : valueProp - step))
      }
      // @ts-ignore
      onWheel?.(e)
    }

    inputRef.current?.addEventListener("wheel", handleWheel, { passive: false })

    return () => inputRef.current?.removeEventListener("wheel", handleWheel)
  })

  return (
    <NumericFormat
      getInputRef={inputRef}
      autoComplete={autoComplete}
      value={valueProp}
      className={!unstyled ? cn(inputClass, className) : className}
      min={min}
      max={max}
      onValueChange={({ floatValue }) => {
        if (floatValue !== undefined) onValueChange(floatValue)
      }}
      onKeyDown={(e) => {
        if (e.key == "ArrowUp") {
          e.preventDefault()
          onValueChange(clamp(valueProp + step))
        }
        if (e.key == "ArrowDown") {
          e.preventDefault()
          onValueChange(clamp(valueProp - step))
        }
        onKeyDown?.(e)
      }}
      {...props}
    />
  )
}
