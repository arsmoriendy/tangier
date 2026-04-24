"use client"

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"
import { MoneyIcon, PackageIcon } from "@phosphor-icons/react/ssr"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { ReactNode } from "react"

function SidebarLink(props: { children: ReactNode; href: string }) {
  const activeClass =
    "bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground hover:brightness-90"
  const isActive = usePathname().startsWith(props.href)

  return (
    <SidebarMenuItem>
      <SidebarMenuButton className={isActive ? activeClass : ""} asChild>
        <Link href={props.href}>{props.children}</Link>
      </SidebarMenuButton>
    </SidebarMenuItem>
  )
}

export function AppSidebar() {
  return (
    <Sidebar>
      <SidebarHeader />
      <SidebarContent>
        <SidebarGroup>
          <SidebarMenu>
            <SidebarLink href="/items">
              <PackageIcon />
              Items
            </SidebarLink>
            <SidebarLink href="/price-groups">
              <MoneyIcon />
              Price groups
            </SidebarLink>
          </SidebarMenu>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter />
    </Sidebar>
  )
}
