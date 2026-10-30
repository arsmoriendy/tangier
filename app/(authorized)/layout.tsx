import { AppSidebar } from "@/components/app-sidebar"
import { SidebarProvider } from "@/components/ui/sidebar"
import { SessionProvider } from "@/contexts/session-ctx"
import { UserSettingsProvider } from "@/contexts/user-settings"
import { getSessionOrRedirect } from "@/lib/auth-guard"
import { getUserSettings } from "@/lib/crud/user-settings"

export default async function AuthorizedLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  const session = await getSessionOrRedirect()
  const userSettings = await getUserSettings({ userId: session.user.id })

  return (
    <SessionProvider session={session}>
      <UserSettingsProvider userSettings={userSettings}>
        <SidebarProvider>
          <AppSidebar />
          <main className="w-full p-2">{children}</main>
        </SidebarProvider>
      </UserSettingsProvider>
    </SessionProvider>
  )
}
