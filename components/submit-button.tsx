import { useFormContext } from "@/components/form"
import AppButton, { AppButtonProps } from "@/components/app-button"

export default function SubmitButton(
  props: Omit<AppButtonProps, "type" | "disabled">
) {
  const form = useFormContext()
  return (
    <form.Subscribe selector={(state) => state.canSubmit}>
      {(canSubmit) => (
        <AppButton disabled={!canSubmit} type="submit" {...props} />
      )}
    </form.Subscribe>
  )
}
