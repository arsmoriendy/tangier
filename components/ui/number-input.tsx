import { inputClass } from "@/components/ui/input"
import { cn } from "@/lib/utils"
import { useEffect, useRef, useState } from "react"
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
  value?: number
  onValueChange?: (value: number) => any
}

export function NumberInput({
  defaultValue = 0,
  step = 1,
  min = -Infinity,
  max = Infinity,
  className,
  onWheel,
  onKeyDown,
  onValueChange,
  unstyled,
  value: valueProp,
  ...props
}: NumberInputProps) {
  const [shadowValue, setShadowValue] = useState(valueProp ?? defaultValue)
  const clamp = (v: number): number => Math.min(max, Math.max(min, v))
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (valueProp !== undefined && valueProp === shadowValue) return
    onValueChange?.(shadowValue)
  }, [shadowValue])

  return (
    <NumericFormat
      getInputRef={inputRef}
      value={valueProp ?? shadowValue}
      className={!unstyled ? cn(inputClass, className) : className}
      min={min}
      max={max}
      onValueChange={({ floatValue }) => {
        if (
          floatValue !== undefined &&
          (valueProp ?? shadowValue) !== floatValue
        )
          setShadowValue(floatValue)
      }}
      onKeyDown={(e) => {
        if (e.key == "ArrowUp") {
          e.preventDefault()
          setShadowValue((old) => clamp(old + step))
        }
        if (e.key == "ArrowDown") {
          e.preventDefault()
          setShadowValue((old) => clamp(old - step))
        }
        onKeyDown?.(e)
      }}
      onWheel={(e) => {
        if (document.activeElement === inputRef.current) {
          setShadowValue((old) => clamp(e.deltaY < 0 ? old + step : old - step))
        }
        onWheel?.(e)
      }}
      {...props}
    />
  )
}
