import {
  NumberField as AriaNumberField,
  type NumberFieldProps as AriaNumberFieldProps,
  Group,
  Label,
  Input,
  Text,
} from "react-aria-components/NumberField"
import { labelClass } from "@/components/ui/label"
import { inputClass } from "@/components/ui/input"
import { useFieldContext } from "@/components/form"
import { errorClass, FieldError, fieldVariants } from "@/components/ui/field"
import { VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

export default function NumberField({
  className,
  orientation = "vertical",
  ...props
}: AriaNumberFieldProps & {
  label?: string
  description?: string
} & VariantProps<typeof fieldVariants>) {
  const field = useFieldContext<number>()
  const isInvalid = !field.state.meta.isValid

  return (
    <AriaNumberField
      isInvalid={isInvalid}
      value={field.state.value}
      className={cn(fieldVariants({ orientation }), className)}
      onChange={field.handleChange}
      onBlur={field.handleBlur}
      {...props}
    >
      {props.label && <Label className={labelClass}>{props.label}</Label>}
      <Group>
        <Input className={inputClass} />
      </Group>
      {props.description && <Text slot="description">{props.description}</Text>}
      {field.state.meta.errors[0] && (
        <FieldError className={errorClass}>
          {field.state.meta.errors[0].message}
        </FieldError>
      )}
    </AriaNumberField>
  )
}
