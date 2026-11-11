"use client"

import { Alert } from "@/components/alert"
import { Form, useAppForm } from "@/components/form"
import { Spinner } from "@/components/spinner"
import { Button } from "@/components/ui/button"
import { authClient } from "@/lib/auth-client"
import { ClockCounterClockwiseIcon } from "@phosphor-icons/react/dist/ssr"
import { useTranslations } from "next-intl"
import { useRouter } from "next/navigation"
import { useState } from "react"
import { toast } from "sonner"
import z from "zod"

export function RestoreForm() {
  const [loading, setLoading] = useState(false)
  const t = useTranslations("backupRestore.restore")
  const router = useRouter()

  const restoreFormSchema = z.object({
    dump: z
      .file()
      .nullable()
      .refine((file): boolean => file !== null, { error: t("fileRequired") }),
  })

  const defaultValues: z.infer<typeof restoreFormSchema> = { dump: null }

  const form = useAppForm({
    defaultValues,
    validators: {
      onMount: restoreFormSchema,
      onChange: restoreFormSchema,
    },
    onSubmit: async ({ value }) => {
      if (!value.dump) return

      setLoading(true)

      const { status } = await fetch("/api/restore", {
        method: "POST",
        body: value.dump,
      })

      setLoading(false)

      if (status !== 200) {
        toast.error(t("error"), { duration: Infinity })
      } else {
        toast.success(t("success"))
        await authClient.signOut()
        router.push("/auth")
      }
    },
  })

  async function handleRestore() {
    await form.handleSubmit()
  }

  return (
    <Form handleSubmit={form.handleSubmit}>
      <form.AppField name="dump">
        {(f) => <f.FileField label={t("fileInputLabel")} accept=".sql" />}
      </form.AppField>

      <form.Subscribe selector={(state) => state.canSubmit}>
        {(canSubmit) => (
          <Alert
            title={t("alertTitle")}
            description={t("alertDescription")}
            action={handleRestore}
            actionIcon={loading ? <Spinner /> : <ClockCounterClockwiseIcon />}
            actionLabel={t("actionLabel")}
            actionVariant="destructive"
            actionProps={{
              type: "button",
              disabled: !canSubmit || loading,
            }}
            trigger={
              <Button type="button" disabled={!canSubmit || loading}>
                {loading ? <Spinner /> : <ClockCounterClockwiseIcon />}
                {t("buttonLabel")}
              </Button>
            }
          />
        )}
      </form.Subscribe>
    </Form>
  )
}
