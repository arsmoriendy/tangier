import { useFieldContext } from "@/components/form"
import {
  Field,
  FieldDescription,
  FieldError,
  FieldLabel,
} from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { ComponentProps } from "react"

export default function TextField({
  label,
  description,
  className,
  onChange,
  ...inputProps
}: {
  label?: string
  description?: string
  className?: string
} & ComponentProps<"input">) {
  const field = useFieldContext<string>()
  const id = `${field.form.formId}-${field.name}`
  const isInvalid = !field.state.meta.isValid

  return (
    <Field className={className}>
      {label && (
        <FieldLabel aria-invalid={isInvalid} htmlFor={id}>
          {label}
        </FieldLabel>
      )}
      <Input
        id={id}
        value={field.state.value}
        onChange={(e) => {
          onChange?.(e)
          field.handleChange(e.target.value)
        }}
        onBlur={field.handleBlur}
        autoComplete="off"
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
