import { Alert } from "@/components/alert"
import { TrashIcon } from "@phosphor-icons/react"
import { useTranslations } from "next-intl"
import { ComponentProps } from "react"

export function DeleteAlert(
  props: Omit<
    ComponentProps<typeof Alert>,
    "actionLabel" | "actionVariant" | "actionIcon"
  >
) {
  const tc = useTranslations("common")

  return (
    <Alert
      actionVariant="destructive"
      actionIcon={<TrashIcon />}
      actionLabel={tc("delete")}
      {...props}
    />
  )
}
