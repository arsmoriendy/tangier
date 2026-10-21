"use client"

import { useFieldContext } from "@/components/form"
import {
  Field,
  FieldDescription,
  FieldError,
  FieldLabel,
} from "@/components/ui/field"
import { ComponentProps, RefObject, useEffect, useRef, useState } from "react"
import { InputGroup, InputGroupAddon, InputGroupInput } from "./ui/input-group"
import { Kbd } from "./ui/kbd"
import { useHotkeys } from "react-hotkeys-hook"
import { useLocalStorage } from "@/contexts/local-storage-ctx"
import {
  Input,
  InputTransformer,
  upperCaseTransformer,
} from "@/components/ui/input"

export default function TextField({
  label,
  description,
  className,
  onChange,
  hotkeys,
  ref = useRef<HTMLInputElement>(null),
  transformers = [],
  disableUppercaseOption,
  ...inputProps
}: Omit<ComponentProps<typeof Input>, "ref"> & {
  label?: string
  description?: string
  className?: string
  hotkeys?: string[]
  disableUppercaseOption?: true
  ref?: RefObject<HTMLInputElement | null>
}) {
  const field = useFieldContext<string>()
  const id = `${field.form.formId}-${field.name}`
  const isInvalid = !field.state.meta.isValid
  const { getLocalStorage } = useLocalStorage()

  if (hotkeys !== undefined) {
    useHotkeys(hotkeys, () => ref.current?.focus(), {
      preventDefault: true,
      enableOnFormTags: true,
    })
  }

  const [getTransformers, setTransformers] =
    useState<InputTransformer[]>(transformers)

  useEffect(() => {
    if (getLocalStorage.uppercaseInput && !disableUppercaseOption) {
      setTransformers((tfs) => [upperCaseTransformer, ...tfs])
    }
  }, [])

  return (
    <Field className={className}>
      {label && (
        <FieldLabel aria-invalid={isInvalid} htmlFor={id}>
          {label}
        </FieldLabel>
      )}
      <InputGroup>
        <InputGroupInput
          id={id}
          ref={ref}
          value={field.state.value}
          onChange={(e) => {
            onChange?.(e)
            field.handleChange(e.target.value)
          }}
          onBlur={field.handleBlur}
          autoComplete="off"
          aria-invalid={isInvalid}
          transformers={getTransformers}
          {...inputProps}
        />
        {hotkeys?.map((hk, i) => (
          <InputGroupAddon key={i} align="inline-end">
            <Kbd>{hk}</Kbd>
          </InputGroupAddon>
        ))}
      </InputGroup>
      {description && <FieldDescription>{description}</FieldDescription>}
      {field.state.meta.errors[0] && (
        <FieldError>{field.state.meta.errors[0].message}</FieldError>
      )}
    </Field>
  )
}
