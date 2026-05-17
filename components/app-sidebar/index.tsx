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
  BarcodeIcon,
  TagIcon,
} from "@phosphor-icons/react/ssr"
import { useTranslations } from "next-intl"
import Link from "next/link"

export function AppSidebar() {
  const session = useSession()
  const t = useTranslations("Sidebar")
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
                      {t("transactions.title")}
                    </Link>
                  </SidebarMenuButton>

                  <SidebarMenuSub>
                    <DynamicSidebarLink href="/transactions/new">
                      {({ href, ...props }) => (
                        <SidebarMenuSubButton asChild {...props}>
                          <Link href={href}>{t("transactions.new")}</Link>
                        </SidebarMenuSubButton>
                      )}
                    </DynamicSidebarLink>
                    <DynamicSidebarLink href="/transactions/history">
                      {({ href, ...props }) => (
                        <SidebarMenuSubButton asChild {...props}>
                          <Link href={href}>{t("transactions.history")}</Link>
                        </SidebarMenuSubButton>
                      )}
                    </DynamicSidebarLink>
                  </SidebarMenuSub>
                </SidebarMenuItem>
              )}
            </DynamicSidebarLink>

            {session.user.role === "admin" && (
              <>
                <DynamicSidebarLink href="/items">
                  {({ href, ...props }) => (
                    <SidebarMenuButton asChild {...props}>
                      <Link href={href}>
                        <PackageIcon />
                        {t("items")}
                      </Link>
                    </SidebarMenuButton>
                  )}
                </DynamicSidebarLink>

                <DynamicSidebarLink href="/units">
                  {({ href, ...props }) => (
                    <SidebarMenuButton asChild {...props}>
                      <Link href={href!}>
                        <TagIcon />
                        {t("units")}
                      </Link>
                    </SidebarMenuButton>
                  )}
                </DynamicSidebarLink>

                <DynamicSidebarLink href="/price-groups">
                  {({ href, ...props }) => (
                    <SidebarMenuButton asChild {...props}>
                      <Link href={href!}>
                        <MoneyIcon />
                        {t("priceGroups")}
                      </Link>
                    </SidebarMenuButton>
                  )}
                </DynamicSidebarLink>

                <DynamicSidebarLink href="/barcode-groups">
                  {({ href, ...props }) => (
                    <SidebarMenuButton asChild {...props}>
                      <Link href={href!}>
                        <BarcodeIcon />
                        {t("barcodeGroups")}
                      </Link>
                    </SidebarMenuButton>
                  )}
                </DynamicSidebarLink>

                <DynamicSidebarLink href="/users">
                  {({ href, ...props }) => (
                    <SidebarMenuButton asChild {...props}>
                      <Link href={href!}>
                        <UsersIcon />
                        {t("users")}
                      </Link>
                    </SidebarMenuButton>
                  )}
                </DynamicSidebarLink>
              </>
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
