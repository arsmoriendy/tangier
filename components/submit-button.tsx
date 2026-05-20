import { useFormContext } from "@/components/form"
import {
  ButtonWithHotkeys,
  type ButtonWithHotkeysProps,
} from "./ui/button-with-hotkeys"

export default function SubmitButton(
  props: Omit<ButtonWithHotkeysProps, "type" | "disabled">
) {
  const form = useFormContext()
  return (
    <form.Subscribe selector={(state) => state.canSubmit}>
      {(canSubmit) => (
        <ButtonWithHotkeys disabled={!canSubmit} type="submit" {...props} />
      )}
    </form.Subscribe>
  )
}
