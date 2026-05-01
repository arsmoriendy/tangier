"use client"

import { nameToEmail } from "@/app/auth/name-to-email"
import { Form, useAppForm } from "@/components/form"
import { FieldError, FieldLegend, FieldSet } from "@/components/ui/field"
import { authClient } from "@/lib/auth-client"
import { kebabCase } from "es-toolkit"
import { redirect } from "next/navigation"
import { useState } from "react"
import z from "zod"

const registerSchema = z.object({
  username: z.string().min(1),
  password: z.string().min(8),
  confirmPassword: z.string().min(8),
})

const registerDefaultValues: z.infer<typeof registerSchema> = {
  username: "",
  password: "",
  confirmPassword: "",
}

export function RegisterForm() {
  const form = useAppForm({
    defaultValues: registerDefaultValues,
    validators: { onMount: registerSchema, onChange: registerSchema },
    onSubmit: async ({ value }) => {
      const { error } = await authClient.signUp.email(
        {
          name: kebabCase(value.username),
          email: nameToEmail(value.username),
          password: value.password,
        },
        {
          onError: ({ error }) => {
            setFormError(error.message ?? error.statusText)
          },
        }
      )
      if (error === null) {
        redirect("/")
      }
    },
  })

  const [formError, setFormError] = useState<string>()

  return (
    <Form handleSubmit={form.handleSubmit}>
      <form.AppForm>
        <FieldSet className="block space-y-2 sm:min-w-sm">
          <FieldLegend>Register</FieldLegend>

          <form.AppField name="username">
            {(f) => (
              <f.TextField
                label="Username"
                onChange={(e) => (e.target.value = kebabCase(e.target.value))}
              />
            )}
          </form.AppField>

          <form.AppField name="password">
            {(f) => <f.TextField type="password" label="Password" />}
          </form.AppField>

          <form.AppField
            name="confirmPassword"
            validators={{
              onChangeListenTo: ["password"],
              onChange: ({ value, fieldApi }) => {
                if (value !== fieldApi.form.getFieldValue("password"))
                  return { message: "Passwords don't match" }
              },
            }}
          >
            {(f) => <f.TextField type="password" label="Confirm password" />}
          </form.AppField>

          <form.SubmitButton>Register</form.SubmitButton>

          {formError && <FieldError>{formError}</FieldError>}
        </FieldSet>
      </form.AppForm>
    </Form>
  )
}
