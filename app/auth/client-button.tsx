"use client"

import { ClientDropdown } from "@/components/client-dropdown"
import { Button } from "@/components/ui/button"
import { XIcon } from "@phosphor-icons/react/dist/ssr"
import { isTauri } from "@tauri-apps/api/core"

export function ClientButton() {
  return (
    isTauri() && (
      <ClientDropdown side="right" align="start">
        <Button
          variant="destructive"
          size="icon"
          className="fixed top-3 right-2"
        >
          <XIcon />
        </Button>
      </ClientDropdown>
    )
  )
}
