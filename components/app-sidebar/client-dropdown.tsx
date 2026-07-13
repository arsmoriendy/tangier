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

export function ClientDropdown({
  children,
  ...props
}: Dropdown.DropdownMenuContentProps) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>{children}</DropdownMenuTrigger>
      <DropdownMenuContent {...props}>
        <DropdownMenuGroup>
          <DropdownMenuLabel>Client menu</DropdownMenuLabel>
          <DropdownMenuItem variant="destructive" onClick={() => exit()}>
            <SignOutIcon /> Exit tangier
          </DropdownMenuItem>
          <DropdownMenuItem
            variant="destructive"
            onClick={() => invoke("shutdown")}
          >
            <PowerIcon /> Shutdown
          </DropdownMenuItem>
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
