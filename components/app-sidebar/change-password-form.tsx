"use client"

import { Form, useAppForm } from "@/components/form"
import { authClient } from "@/lib/auth-client"
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

  return (
    <Form handleSubmit={form.handleSubmit}>
      <form.AppForm>
        <form.AppField name="currentPassword">
          {(f) => <f.TextField label="Current password" type="password" />}
        </form.AppField>

        <form.AppField name="newPassword">
          {(f) => <f.TextField label="New password" type="password" />}
        </form.AppField>

        <form.AppField
          name="confirmNewPassword"
          validators={{
            onChangeListenTo: ["newPassword"],
            onChange: ({ value, fieldApi }) => {
              if (value !== fieldApi.form.getFieldValue("newPassword"))
                return { message: "Passwords don't match" }
            },
          }}
        >
          {(f) => <f.TextField label="Confirm new password" type="password" />}
        </form.AppField>

        <form.SubmitButton>Change username</form.SubmitButton>
      </form.AppForm>
    </Form>
  )
}
