import { useFieldContext } from "@/components/form"
import {
  Field,
  FieldDescription,
  FieldError,
  FieldLabel,
} from "@/components/ui/field"
import { NumberInput, NumberInputProps } from "@/components/ui/number-input"

export default function NumberField({
  label,
  description,
  className,
  ...inputProps
}: {
  label?: string
  description?: string
} & Omit<
  NumberInputProps,
  "id" | "value" | "onValueChange" | "onBlur" | "aria-invalid"
>) {
  const field = useFieldContext<number>()
  const id = `${field.form.formId}-${field.name}`
  const isInvalid = !field.state.meta.isValid

  return (
    <Field className={className}>
      {label && (
        <FieldLabel aria-invalid={isInvalid} htmlFor={id}>
          {label}
        </FieldLabel>
      )}
      <NumberInput
        id={id}
        value={field.state.value}
        onValueChange={({ floatValue }) => field.handleChange(floatValue!)}
        onBlur={field.handleBlur}
        aria-invalid={isInvalid}
        {...inputProps}
      />
      {description && <FieldDescription>{description}</FieldDescription>}
      {field.state.meta.errors[0] && (
        <FieldError>{field.state.meta.errors[0].message}</FieldError>
      )}
    </Field>
  )
}
