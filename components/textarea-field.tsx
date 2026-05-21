"use client"

import { useFieldContext } from "@/components/form"
import {
  Field,
  FieldDescription,
  FieldError,
  FieldLabel,
} from "@/components/ui/field"
import { ComponentProps, RefObject, useRef } from "react"
import { Textarea } from "./ui/textarea"

export default function TextareaField({
  label,
  description,
  className,
  onChange,
  ref: propsRef,
  ...textareaProps
}: Omit<ComponentProps<"textarea">, "ref"> & {
  label?: string
  description?: string
  className?: string
  ref?: RefObject<HTMLTextAreaElement | null>
}) {
  const field = useFieldContext<string>()
  const id = `${field.form.formId}-${field.name}`
  const isInvalid = !field.state.meta.isValid
  const innerRef = useRef<HTMLTextAreaElement>(null)
  const ref = propsRef || innerRef

  return (
    <Field className={className}>
      {label && (
        <FieldLabel aria-invalid={isInvalid} htmlFor={id}>
          {label}
        </FieldLabel>
      )}
      <Textarea
        id={id}
        ref={ref}
        value={field.state.value}
        onChange={(e) => {
          onChange?.(e)
          field.handleChange(e.target.value)
        }}
        onBlur={field.handleBlur}
        aria-invalid={isInvalid}
        {...textareaProps}
      />
      {description && <FieldDescription>{description}</FieldDescription>}
      {field.state.meta.errors[0] && (
        <FieldError>{field.state.meta.errors[0].message}</FieldError>
      )}
    </Field>
  )
}
