"use client"

import { nameToEmail } from "@/app/auth/name-to-email"
import { Form, useAppForm } from "@/components/form"
import { FieldError } from "@/components/ui/field"
import { authClient } from "@/lib/auth-client"
import { kebabCase } from "es-toolkit"
import { redirect } from "next/navigation"
import { useState } from "react"
import z from "zod"

const registerSchema = z.object({
  username: z.string().min(1),
  password: z.string().min(3),
})

const registerDefaultValues: z.infer<typeof registerSchema> = {
  username: "",
  password: "",
}

export function SignInForm() {
  const form = useAppForm({
    defaultValues: registerDefaultValues,
    validators: { onMount: registerSchema, onChange: registerSchema },
    onSubmit: async ({ value }) => {
      const { error } = await authClient.signIn.email(
        {
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

        <form.SubmitButton>Sign in</form.SubmitButton>

        {formError && <FieldError>{formError}</FieldError>}
      </form.AppForm>
    </Form>
  )
}
