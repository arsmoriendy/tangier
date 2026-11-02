"use client"

import { useFieldContext } from "@/components/form"
import {
  Field,
  FieldDescription,
  FieldError,
  FieldLabel,
} from "@/components/ui/field"
import { ComponentProps, RefObject, useRef } from "react"
import { InputGroup, InputGroupAddon } from "./ui/input-group"
import { Kbd } from "./ui/kbd"
import { useHotkeys } from "react-hotkeys-hook"
import { Input } from "@/components/ui/input"
import { UserInput } from "@/components/user-input"

export default function TextField({
  label,
  description,
  className,
  onChange,
  hotkeys,
  ref = useRef<HTMLInputElement>(null),
  transformers = [],
  disableUppercaseOption,
  hideHotkeys,
  hideErrors,
  ...inputProps
}: Omit<ComponentProps<typeof Input>, "ref"> & {
  label?: string
  description?: string
  className?: string
  hotkeys?: string[]
  disableUppercaseOption?: true
  hideHotkeys?: true
  hideErrors?: true
  ref?: RefObject<HTMLInputElement | null>
}) {
  const field = useFieldContext<string>()
  const id = `${field.form.formId}-${field.name}`
  const isInvalid = !field.state.meta.isValid

  if (hotkeys !== undefined) {
    useHotkeys(hotkeys, () => ref.current?.focus(), {
      preventDefault: true,
      enableOnFormTags: true,
    })
  }

  return (
    <Field className={className}>
      {label && (
        <FieldLabel aria-invalid={isInvalid} htmlFor={id}>
          {label}
        </FieldLabel>
      )}
      <InputGroup>
        <UserInput
          group
          id={id}
          ref={ref}
          value={field.state.value}
          onChange={(e) => {
            onChange?.(e)
            field.handleChange(e.target.value)
          }}
          onBlur={field.handleBlur}
          disableUppercaseOption={disableUppercaseOption}
          autoComplete="off"
          aria-invalid={isInvalid}
          {...inputProps}
        />

        {!hideHotkeys &&
          hotkeys?.map((hk, i) => (
            <InputGroupAddon key={i} align="inline-end">
              <Kbd>{hk}</Kbd>
            </InputGroupAddon>
          ))}
      </InputGroup>
      {description && <FieldDescription>{description}</FieldDescription>}
      {!hideErrors && field.state.meta.errors[0] && (
        <FieldError>{field.state.meta.errors[0].message}</FieldError>
      )}
    </Field>
  )
}
