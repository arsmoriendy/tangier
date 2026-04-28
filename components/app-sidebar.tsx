"use client"

import { Button, ButtonProps } from "@/components/ui/button"
import { ButtonGroup } from "@/components/ui/button-group"
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
} from "@/components/ui/sidebar"
import { cn } from "@/lib/utils"
import {
  MoneyIcon,
  PackageIcon,
  BasketIcon,
  SunIcon,
  MoonIcon,
  DesktopIcon,
} from "@phosphor-icons/react/ssr"
import { useTheme } from "next-themes"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { ReactNode, useEffect, useState } from "react"

function DynamicSidebarLink(props: {
  children: (props: { className: string; href: string }) => ReactNode
  href: string
}) {
  const activeClass =
    "bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground hover:brightness-90"

  const isActive = usePathname().startsWith(props.href)

  return props.children({
    className: isActive ? activeClass : "",
    href: props.href,
  })
}

function ThemeButton({
  theme,
  className,
  onClick,
  variant,
  ...props
}: { theme: string } & ButtonProps) {
  const [mounted, setMounted] = useState(false)
  const themeState = useTheme()

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return <Button variant={variant ?? "ghost"} {...props} />
  }

  return (
    <Button
      className={cn(
        className,
        themeState.theme === theme ? "" : "",
        "border-0"
      )}
      variant={variant ?? (themeState.theme === theme ? "default" : "ghost")}
      onClick={(e) => {
        themeState.setTheme(theme)
        onClick?.(e)
      }}
      {...props}
    />
  )
}

export function AppSidebar() {
  return (
    <Sidebar>
      <SidebarHeader />
      <SidebarContent>
        <SidebarGroup>
          <SidebarMenu>
            <DynamicSidebarLink href="/transactions">
              {({ href, ...props }) => (
                <SidebarMenuItem>
                  <SidebarMenuButton {...props}>
                    <BasketIcon />
                    Transactions
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
          </SidebarMenu>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter>
        <ButtonGroup className="border">
          <ThemeButton theme="light">
            <SunIcon /> Light
          </ThemeButton>
          <ThemeButton theme="system">
            <DesktopIcon /> System
          </ThemeButton>
          <ThemeButton theme="dark">
            <MoonIcon /> Dark
          </ThemeButton>
        </ButtonGroup>
      </SidebarFooter>
    </Sidebar>
  )
}
