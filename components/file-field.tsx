"use client"

import { useFieldContext } from "@/components/form"
import {
  Field,
  FieldDescription,
  FieldError,
  FieldLabel,
} from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { ComponentProps } from "react"

export default function FileField({
  label,
  description,
  className,
  ...inputProps
}: Omit<ComponentProps<typeof Input>, "type" | "value" | "onChange"> & {
  label?: string
  description?: string
  className?: string
}) {
  const field = useFieldContext<File | null>()
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
        type="file"
        id={id}
        aria-invalid={isInvalid}
        onChange={(e) => field.handleChange(e.target.files?.[0] ?? null)}
        onBlur={field.handleBlur}
        {...inputProps}
      />
      {description && <FieldDescription>{description}</FieldDescription>}
      {field.state.meta.errors[0] && (
        <FieldError>{field.state.meta.errors[0].message}</FieldError>
      )}
    </Field>
  )
}
