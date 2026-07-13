"use client"

import { DropdownMenu as Dropdown } from "radix-ui"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { PowerIcon, SignOutIcon } from "@phosphor-icons/react"
import { invoke } from "@tauri-apps/api/core"
import { exit } from "@tauri-apps/plugin-process"
import { useTranslations } from "next-intl"
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

export function ClientDropdown({
  children,
  ...props
}: Dropdown.DropdownMenuContentProps) {
  const t = useTranslations("sidebar.client")
  return (
    <AlertDialog>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>{children}</DropdownMenuTrigger>
        <DropdownMenuContent {...props}>
          <DropdownMenuGroup>
            <DropdownMenuLabel>{t("title")}</DropdownMenuLabel>
            <DropdownMenuItem variant="destructive" onClick={() => exit()}>
              <SignOutIcon /> {t("exit")}
            </DropdownMenuItem>
            <AlertDialogTrigger asChild>
              <DropdownMenuItem variant="destructive">
                <PowerIcon /> {t("shutdown.label")}
              </DropdownMenuItem>
            </AlertDialogTrigger>
          </DropdownMenuGroup>
        </DropdownMenuContent>
      </DropdownMenu>

      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{t("shutdown.confirmTitle")}</AlertDialogTitle>
          <AlertDialogDescription>
            {t("shutdown.confirmDescription")}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>{t("shutdown.cancel")}</AlertDialogCancel>
          <AlertDialogAction onClick={() => invoke("shutdown")}>
            {t("shutdown.confirm")}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
