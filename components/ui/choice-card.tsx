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
import { cn } from "@/lib/utils"
import { ReactNode, useId } from "react"

export function RadioGroupChoiceCard({ className, ...props }: RadioGroupProps) {
  return <RadioGroup className={cn("max-w-sm", className)} {...props} />
}

export function RadioGroupChoiceItem({
  className,
  title,
  description,
  ...props
}: RadioGroupItemProps & { title: ReactNode; description: ReactNode }) {
  const id = props.id ?? useId()

  return (
    <FieldLabel htmlFor={id}>
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
