import IdrField from "@/components/idr-field"
import NumberField from "@/components/number-field"
import SubmitButton from "@/components/submit-button"
import TextField from "@/components/text-field"
import { cn } from "@/lib/utils"
import { createFormHook, createFormHookContexts } from "@tanstack/react-form"
import { ComponentProps } from "react"

export const { fieldContext, formContext, useFieldContext, useFormContext } =
  createFormHookContexts()

export const { useAppForm } = createFormHook({
  fieldComponents: { TextField, NumberField, IdrField },
  formComponents: {
    SubmitButton,
  },
  fieldContext,
  formContext,
})

export function Form({
  handleSubmit,
  className,
  ...props
}: Omit<ComponentProps<"form">, "onSubmit"> & { handleSubmit: () => void }) {
  return (
    <form
      className={cn("space-y-2", className)}
      onSubmit={(e) => {
        e.preventDefault()
        e.stopPropagation()
        handleSubmit()
      }}
      {...props}
    />
  )
}
