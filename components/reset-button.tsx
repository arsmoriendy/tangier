import { useTranslations } from "next-intl"
import { Button, ButtonProps } from "./ui/button"

export function ResetButton({
  variant = "destructive",
  type = "reset",
  ...props
}: ButtonProps) {
  const t = useTranslations("common")
  return (
    <Button variant={variant} type={type} {...props}>
      {t("reset")}
    </Button>
  )
}
