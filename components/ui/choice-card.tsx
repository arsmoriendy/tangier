import {
  Field,
  FieldContent,
  FieldDescription,
  FieldLabel,
  FieldTitle,
} from "@/components/ui/field"
import {
  RadioGroup,
  RadioGroupItem,
  RadioGroupItemProps,
  RadioGroupProps,
} from "@/components/ui/radio-group"
import { ReactNode, useId } from "react"

export function RadioGroupChoiceCard({ ...props }: RadioGroupProps) {
  return <RadioGroup {...props} />
}

export function RadioGroupChoiceItem({
  className,
  title,
  description,
  ...props
}: RadioGroupItemProps & { title: ReactNode; description: ReactNode }) {
  const id = props.id ?? useId()

  return (
    <FieldLabel className={className} htmlFor={id}>
      <Field orientation="horizontal">
        <FieldContent>
          <FieldTitle>{title}</FieldTitle>
          <FieldDescription>{description}</FieldDescription>
        </FieldContent>
        <RadioGroupItem id={id} {...props} />
      </Field>
    </FieldLabel>
  )
}
