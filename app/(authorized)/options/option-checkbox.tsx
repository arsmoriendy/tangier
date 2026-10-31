import { Checkbox } from "@/components/ui/checkbox"
import { Field, FieldLabel } from "@/components/ui/field"

export default function OptionCheckbox({
  checked,
  onCheckedChange,
  label,
}: {
  checked: boolean
  onCheckedChange: (c: boolean) => void
  label: string
}) {
  return (
    <Field orientation="horizontal" className="gap-2">
      <Checkbox checked={checked} onCheckedChange={onCheckedChange} />
      <FieldLabel>{label}</FieldLabel>
    </Field>
  )
}
