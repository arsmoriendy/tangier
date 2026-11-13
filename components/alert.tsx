"use client"

import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { Button, type ButtonVariant } from "@/components/ui/button"
import { ComponentProps, ReactNode, useState } from "react"

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
  /** May be async: the dialog stays open with a spinner until it settles. */
  action?: () => any
  actionVariant?: ButtonVariant
  actionIcon?: ReactNode
  actionLabel?: ReactNode
  actionProps?: Omit<
    ComponentProps<typeof Button>,
    "variant" | "onClick" | "children" | "loading"
  >
  trigger: ReactNode
}) {
  const [open, setOpen] = useState(false)
  const [pending, setPending] = useState(false)

  function handleOpenChange(next: boolean) {
    // Escape / outside click must not close the dialog mid-action
    if (pending) return
    setOpen(next)
  }

  async function runAction() {
    if (action === undefined) {
      setOpen(false)
      return
    }

    setPending(true)
    try {
      await action()
    } finally {
      setPending(false)
      setOpen(false)
    }
  }

  return (
    <AlertDialog open={open} onOpenChange={handleOpenChange}>
      <AlertDialogTrigger asChild>{trigger}</AlertDialogTrigger>
      <AlertDialogContent size="sm">
        <AlertDialogHeader>
          <AlertDialogTitle>{title}</AlertDialogTitle>
          <AlertDialogDescription>{description}</AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={pending}>Cancel</AlertDialogCancel>
          <Button
            variant={actionVariant}
            loading={pending}
            onClick={runAction}
            {...actionProps}
          >
            {actionIcon}
            {actionLabel}
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
