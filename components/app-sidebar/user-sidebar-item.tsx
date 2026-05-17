import { ChangePasswordForm } from "@/components/app-sidebar/change-password-form"
import { ChangeUsernameForm } from "@/components/app-sidebar/change-username-form"
import {
  DialogTrigger,
  Dialog,
  DialogContent,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  DropdownMenu,
  DropdownMenuItem,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { SidebarMenuButton, SidebarMenuItem } from "@/components/ui/sidebar"
import { useSession } from "@/contexts/session-ctx"
import { authClient } from "@/lib/auth-client"
import { SignOutIcon, TrashIcon, UserCircleIcon } from "@phosphor-icons/react"
import { useTranslations } from "next-intl"
import { redirect } from "next/navigation"
import { toast } from "sonner"

export function UserSidebarItem() {
  const session = useSession()
  const t = useTranslations("Sidebar.account")
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
                {t("header")}
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
            <DropdownMenuLabel>{t("title")}</DropdownMenuLabel>

            <Dialog>
              <DialogTrigger asChild>
                <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                  {t("changeUsername.title")}
                </DropdownMenuItem>
              </DialogTrigger>

              <DialogContent>
                <DialogTitle>{t("changeUsername.title")}</DialogTitle>
                <ChangeUsernameForm />
              </DialogContent>
            </Dialog>

            <Dialog>
              <DialogTrigger asChild>
                <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                  {t("changePassword.title")}
                </DropdownMenuItem>
              </DialogTrigger>

              <DialogContent>
                <DialogTitle>{t("changePassword.title")}</DialogTitle>
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
              {t("signOut")}
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
              {t("deleteAccount")}
            </DropdownMenuItem>
          </DropdownMenuGroup>
        </DropdownMenuContent>
      </DropdownMenu>
    </SidebarMenuItem>
  )
}
