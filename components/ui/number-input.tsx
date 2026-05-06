import { inputClass } from "@/components/ui/input"
import { cn } from "@/lib/utils"
import { useEffect, useRef, useState } from "react"
import { NumericFormat, NumericFormatProps } from "react-number-format"

export type NumberInputProps = Omit<
  NumericFormatProps,
  "defaultValue" | "step" | "min" | "max" | "value"
> & {
  defaultValue?: number
  step?: number
  min?: number
  max?: number
  unstyled?: true
  value: number
}

export function NumberInput({
  defaultValue = 0,
  step = 1,
  min = -Infinity,
  max = Infinity,
  className,
  onWheel,
  onKeyDown,
  unstyled,
  value: valueProp,
  ...props
}: NumberInputProps) {
  const [value, setValue] = useState(defaultValue)
  const clamp = (v: number): number => Math.min(max, Math.max(min, v))
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    setValue(valueProp!)
  }, [valueProp])

  return (
    <NumericFormat
      getInputRef={inputRef}
      value={value}
      className={!unstyled ? cn(inputClass, className) : className}
      min={min}
      max={max}
      onKeyDown={(e) => {
        if (e.key == "ArrowUp") {
          e.preventDefault()
          setValue((old) => clamp(old + step))
        }
        if (e.key == "ArrowDown") {
          e.preventDefault()
          setValue((old) => clamp(old - step))
        }
        onKeyDown?.(e)
      }}
      onWheel={(e) => {
        if (document.activeElement === inputRef.current) {
          setValue((old) => clamp(e.deltaY < 0 ? old + step : old - step))
        }
        onWheel?.(e)
      }}
      {...props}
    />
  )
}
