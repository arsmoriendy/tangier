"use client"

import { ChangePasswordForm } from "@/components/change-password-form"
import { ChangeUsernameForm } from "@/components/change-username-form"
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
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
import { authClient } from "@/lib/auth-client"
import capitalize from "@/lib/capitalize"
import {
  MoneyIcon,
  PackageIcon,
  BasketIcon,
  SunIcon,
  MoonIcon,
  DesktopIcon,
  SignOutIcon,
  UserCircleIcon,
  UsersIcon,
  TrashIcon,
} from "@phosphor-icons/react/ssr"
import { useTheme } from "next-themes"
import Link from "next/link"
import { redirect, usePathname } from "next/navigation"
import { ReactNode, useEffect, useState } from "react"
import { toast } from "sonner"

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

function ThemeSidebarItem() {
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)
  const themeIconMap: { [theme: string]: ReactNode } = {
    light: <SunIcon />,
    system: <DesktopIcon />,
    dark: <MoonIcon />,
  }

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) return null

  return (
    <SidebarMenuItem>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <SidebarMenuButton>
            {themeIconMap[theme ?? ""] ?? <DesktopIcon />} Theme
          </SidebarMenuButton>
        </DropdownMenuTrigger>

        <DropdownMenuContent
          side="right"
          align="end"
          className="relative left-2"
        >
          <DropdownMenuGroup>
            <DropdownMenuLabel>Theme</DropdownMenuLabel>
            <DropdownMenuRadioGroup value={theme} onValueChange={setTheme}>
              {Object.entries(themeIconMap).map(([theme, icon], i) => (
                <DropdownMenuRadioItem key={i} value={theme}>
                  {icon} {capitalize(theme)}
                </DropdownMenuRadioItem>
              ))}
            </DropdownMenuRadioGroup>
          </DropdownMenuGroup>
        </DropdownMenuContent>
      </DropdownMenu>
    </SidebarMenuItem>
  )
}

function UserSidebarItem() {
  const session = useSession()
  return (
    <SidebarMenuItem>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <SidebarMenuButton size="lg">
            <div className="grid aspect-square size-8 place-items-center">
              <UserCircleIcon />
            </div>
            <div className="space-y-0.5">
              <small className="block text-muted-foreground">
                Signed in as
              </small>
              <span>{session.user.name}</span>
            </div>
          </SidebarMenuButton>
        </DropdownMenuTrigger>
        <DropdownMenuContent
          side="right"
          align="end"
          className="relative left-2 min-w-3xs"
        >
          <DropdownMenuGroup>
            <DropdownMenuLabel>Manage account</DropdownMenuLabel>

            <Dialog>
              <DialogTrigger asChild>
                <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                  Change username
                </DropdownMenuItem>
              </DialogTrigger>

              <DialogContent>
                <DialogTitle>Change username</DialogTitle>
                <ChangeUsernameForm />
              </DialogContent>
            </Dialog>

            <Dialog>
              <DialogTrigger asChild>
                <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                  Change password
                </DropdownMenuItem>
              </DialogTrigger>

              <DialogContent>
                <DialogTitle>Change password</DialogTitle>
                <ChangePasswordForm />
              </DialogContent>
            </Dialog>

            <DropdownMenuSeparator />

            <DropdownMenuItem
              variant="destructive"
              onClick={async () => {
                await authClient.signOut()
                redirect("/")
              }}
            >
              <SignOutIcon />
              Sign out
            </DropdownMenuItem>

            <DropdownMenuItem
              variant="destructive"
              onClick={async () => {
                const { error } = await authClient.deleteUser()
                if (error) {
                  toast.error(error.message ?? error.statusText)
                  return
                }
                redirect("/")
              }}
            >
              <TrashIcon />
              Delete account
            </DropdownMenuItem>
          </DropdownMenuGroup>
        </DropdownMenuContent>
      </DropdownMenu>
    </SidebarMenuItem>
  )
}

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
