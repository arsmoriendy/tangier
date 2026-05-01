"use client"

import { nameToEmail } from "@/app/auth/name-to-email"
import { Form, useAppForm } from "@/components/form"
import { useSession } from "@/contexts/session-ctx"
import { authClient } from "@/lib/auth-client"
import { kebabCase } from "es-toolkit"
import { toast } from "sonner"
import z from "zod"

export function ChangeUsernameForm() {
  const session = useSession()
  const schema = z.object({ username: z.string().min(1) })
  const form = useAppForm({
    defaultValues: { username: session.user.name },
    validators: { onMount: schema, onChange: schema },
    onSubmit: async ({ value: { username } }) => {
      var { error } = await authClient.changeEmail({
        newEmail: nameToEmail(username),
      })
      if (error) {
        toast.error(error.message ?? error.statusText)
        return
      }

      var { error } = await authClient.updateUser({ name: username })
      if (error) {
        toast.error(error.message ?? error.statusText)
        return
      }

      toast.success("Username changed")

      window.location.reload()
    },
  })

  return (
    <Form handleSubmit={form.handleSubmit}>
      <form.AppForm>
        <form.AppField name="username">
          {(f) => (
            <f.TextField
              label="New username"
              onChange={(e) => (e.target.value = kebabCase(e.target.value))}
            />
          )}
        </form.AppField>

        <form.SubmitButton>Change username</form.SubmitButton>
      </form.AppForm>
    </Form>
  )
}
