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
  return (
    <AlertDialog>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>{children}</DropdownMenuTrigger>
        <DropdownMenuContent {...props}>
          <DropdownMenuGroup>
            <DropdownMenuLabel>Client menu</DropdownMenuLabel>
            <DropdownMenuItem variant="destructive" onClick={() => exit()}>
              <SignOutIcon /> Exit tangier
            </DropdownMenuItem>
            <AlertDialogTrigger asChild>
              <DropdownMenuItem variant="destructive">
                <PowerIcon /> Shutdown
              </DropdownMenuItem>
            </AlertDialogTrigger>
          </DropdownMenuGroup>
        </DropdownMenuContent>
      </DropdownMenu>

      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Confirm shutdown</AlertDialogTitle>
          <AlertDialogDescription>
            Are you sure you want to shutdown this computer?
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction onClick={() => invoke("shutdown")}>
            Confirm
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
