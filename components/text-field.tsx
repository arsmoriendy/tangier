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
}) {
  const field = useFieldContext<string>()
  const id = `${field.form.formId}-${field.name}`

  return (
    <Field>
      {props.label && <FieldLabel htmlFor={id}>{props.label}</FieldLabel>}
      <Input
        id={id}
        value={field.state.value}
        onChange={(e) => field.handleChange(e.target.value)}
        onBlur={field.handleBlur}
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
