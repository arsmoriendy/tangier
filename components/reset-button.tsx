import { useTranslations } from "next-intl"
import {
  ButtonWithHotkeys,
  ButtonWithHotkeysProps,
} from "./ui/button-with-hotkeys"
import { ArrowCounterClockwiseIcon } from "@phosphor-icons/react"

export function ResetButton({
  variant = "destructive",
  type = "reset",
  ...props
}: ButtonWithHotkeysProps) {
  const t = useTranslations("common")
  return (
    <ButtonWithHotkeys variant={variant} type={type} {...props}>
      <ArrowCounterClockwiseIcon />
      {t("reset")}
    </ButtonWithHotkeys>
  )
}
