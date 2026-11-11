import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { type ButtonVariant } from "@/components/ui/button"
import { ComponentProps, ReactNode } from "react"

export function Alert({
  title,
  description,
  action,
  actionVariant,
  actionIcon,
  actionLabel,
  actionProps,
  trigger,
}: {
  title: ReactNode
  description?: ReactNode
  action?: () => any
  actionVariant?: ButtonVariant
  actionIcon?: ReactNode
  actionLabel?: ReactNode
  actionProps?: Omit<
    ComponentProps<typeof AlertDialogAction>,
    "variant" | "onClick" | "children"
  >
  trigger: ReactNode
}) {
  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>{trigger}</AlertDialogTrigger>
      <AlertDialogContent size="sm">
        <AlertDialogHeader>
          <AlertDialogTitle>{title}</AlertDialogTitle>
          <AlertDialogDescription>{description}</AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction
            variant={actionVariant}
            onClick={action}
            {...actionProps}
          >
            {actionIcon}
            {actionLabel}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
