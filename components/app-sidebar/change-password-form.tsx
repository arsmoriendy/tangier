"use client"

import { Form, useAppForm } from "@/components/form"
import { authClient } from "@/lib/auth-client"
import { useTranslations } from "next-intl"
import { toast } from "sonner"
import z from "zod"

export function ChangePasswordForm() {
  const schema = z.object({
    currentPassword: z.string(),
    newPassword: z.string().min(8),
    confirmNewPassword: z.string().min(8),
  })
  const form = useAppForm({
    defaultValues: {
      currentPassword: "",
      newPassword: "",
      confirmNewPassword: "",
    },
    validators: { onMount: schema, onChange: schema },
    onSubmit: async ({ value: { currentPassword, newPassword } }) => {
      var { error } = await authClient.changePassword({
        currentPassword,
        newPassword,
      })
      if (error) {
        toast.error(error.message ?? error.statusText)
        return
      }

      toast.success("Password changed")
    },
  })
  const t = useTranslations("Sidebar.account.changePassword")

  return (
    <Form handleSubmit={form.handleSubmit}>
      <form.AppForm>
        <form.AppField name="currentPassword">
          {(f) => <f.TextField label={t("currentPassword")} type="password" />}
        </form.AppField>

        <form.AppField name="newPassword">
          {(f) => <f.TextField label={t("newPassword")} type="password" />}
        </form.AppField>

        <form.AppField
          name="confirmNewPassword"
          validators={{
            onChangeListenTo: ["newPassword"],
            onChange: ({ value, fieldApi }) => {
              if (value !== fieldApi.form.getFieldValue("newPassword"))
                return { message: t("errors.passwordMatch") }
            },
          }}
        >
          {(f) => <f.TextField label={t("confirmPassword")} type="password" />}
        </form.AppField>

        <form.SubmitButton>{t("title")}</form.SubmitButton>
      </form.AppForm>
    </Form>
  )
}
