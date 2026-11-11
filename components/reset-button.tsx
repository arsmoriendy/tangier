import { useTranslations } from "next-intl"
import { ArrowCounterClockwiseIcon } from "@phosphor-icons/react"
import AppButton, { AppButtonProps } from "@/components/app-button"

export function ResetButton({
  variant = "destructive",
  type = "reset",
  ...props
}: AppButtonProps) {
  const t = useTranslations("common")
  return (
    <AppButton variant={variant} type={type} {...props}>
      <ArrowCounterClockwiseIcon />
      {t("reset")}
    </AppButton>
  )
}
