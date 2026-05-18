"use client"

import { nameToEmail } from "@/app/auth/name-to-email"
import { Form, useAppForm } from "@/components/form"
import { FieldError } from "@/components/ui/field"
import { authClient } from "@/lib/auth-client"
import { kebabCase } from "es-toolkit"
import { useTranslations } from "next-intl"
import { redirect } from "next/navigation"
import { useState } from "react"
import z from "zod"

const registerSchema = z.object({
  username: z.string().min(1),
  password: z.string().min(3),
  confirmPassword: z.string().min(3),
})

const registerDefaultValues: z.infer<typeof registerSchema> = {
  username: "",
  password: "",
  confirmPassword: "",
}

export function SignUpForm() {
  const t = useTranslations("auth")
  const tc = useTranslations("common")
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
        <form.AppField name="username">
          {(f) => (
            <f.TextField
              label={tc("username")}
              onChange={(e) => (e.target.value = kebabCase(e.target.value))}
            />
          )}
        </form.AppField>

        <form.AppField name="password">
          {(f) => <f.TextField type="password" label={tc("password")} />}
        </form.AppField>

        <form.AppField
          name="confirmPassword"
          validators={{
            onChangeListenTo: ["password"],
            onChange: ({ value, fieldApi }) => {
              if (value !== fieldApi.form.getFieldValue("password"))
                return { message: t("errors.passwordMatch") }
            },
          }}
        >
          {(f) => <f.TextField type="password" label={t("confirmPassword")} />}
        </form.AppField>

        <form.SubmitButton>{t("signUp")}</form.SubmitButton>

        {formError && <FieldError>{formError}</FieldError>}
      </form.AppForm>
    </Form>
  )
}
