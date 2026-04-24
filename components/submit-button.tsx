import { useFormContext } from "@/components/form"
import { Button, ButtonProps } from "@/components/ui/button"

export default function SubmitButton(props: Omit<ButtonProps, "type">) {
  const form = useFormContext()
  return (
    <form.Subscribe selector={(state) => state.canSubmit}>
      {(canSubmit) => <Button disabled={!canSubmit} type="submit" {...props} />}
    </form.Subscribe>
  )
}
