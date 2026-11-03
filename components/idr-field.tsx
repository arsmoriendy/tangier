import { useFieldContext } from "@/components/form"
import {
  Field,
  FieldDescription,
  FieldError,
  FieldLabel,
} from "@/components/ui/field"
import { UserIdrInput, UserIdrInputProps } from "@/components/user-idr-input"

export default function IdrField({
  label,
  description,
  className,
  ...inputProps
}: {
  label?: string
  description?: string
} & Omit<
  UserIdrInputProps,
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
      <UserIdrInput
        id={id}
        value={field.state.value}
        onValueChange={(floatValue) =>
          floatValue !== field.state.value && field.handleChange(floatValue)
        }
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
