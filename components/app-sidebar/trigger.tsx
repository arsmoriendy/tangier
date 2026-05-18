"use client"

import { SidebarIcon } from "@phosphor-icons/react"
import { SidebarMenuButton, useSidebar } from "../ui/sidebar"
import { Badge } from "../ui/badge"

export function Trigger() {
  const { toggleSidebar } = useSidebar()
  return (
    <SidebarMenuButton onClick={toggleSidebar}>
      <SidebarIcon />
      <b>
        Tangier POS <Badge>v1</Badge>
      </b>
    </SidebarMenuButton>
  )
}
