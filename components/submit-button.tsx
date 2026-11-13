import { useFormContext } from "@/components/form"
import AppButton, { AppButtonProps } from "@/components/app-button"

export default function SubmitButton(
  props: Omit<AppButtonProps, "type" | "disabled" | "loading">
) {
  const form = useFormContext()
  return (
    <form.Subscribe selector={(state) => state.canSubmit}>
      {(canSubmit) => (
        <form.Subscribe selector={(state) => state.isSubmitting}>
          {(isSubmitting) => (
            <AppButton
              disabled={!canSubmit}
              loading={isSubmitting}
              type="submit"
              {...props}
            />
          )}
        </form.Subscribe>
      )}
    </form.Subscribe>
  )
}
