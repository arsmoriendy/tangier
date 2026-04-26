import { NumberInputProps, NumberInput } from "@/components/number-input"

type IdrInputProps = Omit<
  NumberInputProps,
  | "decimalScale"
  | "fixedDecimalScale"
  | "decimalSeparator"
  | "thousandSeparator"
>

export function IdrInput({ step = 500, ...props }: IdrInputProps) {
  return (
    <NumberInput
      decimalScale={2}
      step={step}
      fixedDecimalScale
      decimalSeparator=","
      thousandSeparator="."
      {...props}
    />
  )
}
