import { useFieldContext } from "@/components/form"
import {
  Field,
  FieldDescription,
  FieldError,
  FieldLabel,
} from "@/components/ui/field"
import { Input } from "@/components/ui/input"

export default function TextField(props: {
  label?: string
  description?: string
  className?: string
}) {
  const field = useFieldContext<string>()
  const id = `${field.form.formId}-${field.name}`
  const isInvalid = !field.state.meta.isValid

  return (
    <Field className={props.className}>
      {props.label && (
        <FieldLabel aria-invalid={isInvalid} htmlFor={id}>
          {props.label}
        </FieldLabel>
      )}
      <Input
        id={id}
        value={field.state.value}
        onChange={(e) => field.handleChange(e.target.value)}
        onBlur={field.handleBlur}
        autoComplete="off"
        aria-invalid={isInvalid}
      />
      {props.description && (
        <FieldDescription>{props.description}</FieldDescription>
      )}
      {field.state.meta.errors[0] && (
        <FieldError>{field.state.meta.errors[0].message}</FieldError>
      )}
    </Field>
  )
}
