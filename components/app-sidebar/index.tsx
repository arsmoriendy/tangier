"use client"

import { DynamicSidebarLink } from "@/components/app-sidebar/dynamic-sidebar-link"
import { ThemeSidebarItem } from "@/components/app-sidebar/theme-sidebar-item"
import { UserSidebarItem } from "@/components/app-sidebar/user-sidebar-item"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarTrigger,
} from "@/components/ui/sidebar"
import { useSession } from "@/contexts/session-ctx"
import {
  MoneyIcon,
  PackageIcon,
  BasketIcon,
  UsersIcon,
} from "@phosphor-icons/react/ssr"
import Link from "next/link"

export function AppSidebar() {
  const session = useSession()
  return (
    <Sidebar collapsible="icon">
      <SidebarHeader>
        <SidebarTrigger />
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarMenu>
            <DynamicSidebarLink href="/transactions">
              {({ href, ...props }) => (
                <SidebarMenuItem>
                  <SidebarMenuButton asChild {...props}>
                    <Link href="/transactions/new">
                      <BasketIcon />
                      Transactions
                    </Link>
                  </SidebarMenuButton>

                  <SidebarMenuSub>
                    <DynamicSidebarLink href="/transactions/new">
                      {({ href, ...props }) => (
                        <SidebarMenuSubButton asChild {...props}>
                          <Link href={href}>New</Link>
                        </SidebarMenuSubButton>
                      )}
                    </DynamicSidebarLink>
                    <DynamicSidebarLink href="/transactions/history">
                      {({ href, ...props }) => (
                        <SidebarMenuSubButton asChild {...props}>
                          <Link href={href}>History</Link>
                        </SidebarMenuSubButton>
                      )}
                    </DynamicSidebarLink>
                  </SidebarMenuSub>
                </SidebarMenuItem>
              )}
            </DynamicSidebarLink>

            <DynamicSidebarLink href="/items">
              {({ href, ...props }) => (
                <SidebarMenuButton asChild {...props}>
                  <Link href={href}>
                    <PackageIcon />
                    Items
                  </Link>
                </SidebarMenuButton>
              )}
            </DynamicSidebarLink>

            <DynamicSidebarLink href="/price-groups">
              {({ href, ...props }) => (
                <SidebarMenuButton asChild {...props}>
                  <Link href={href!}>
                    <MoneyIcon />
                    Price groups
                  </Link>
                </SidebarMenuButton>
              )}
            </DynamicSidebarLink>

            {session.user.role === "admin" && (
              <DynamicSidebarLink href="/users">
                {({ href, ...props }) => (
                  <SidebarMenuButton asChild {...props}>
                    <Link href={href!}>
                      <UsersIcon />
                      Users
                    </Link>
                  </SidebarMenuButton>
                )}
              </DynamicSidebarLink>
            )}
          </SidebarMenu>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter>
        <SidebarMenu className="gap-2">
          <ThemeSidebarItem />
          <hr />
          <UserSidebarItem />
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  )
}
