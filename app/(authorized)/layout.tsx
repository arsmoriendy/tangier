import { AppSidebar } from "@/components/app-sidebar"
import { PersistentSidebarProvider } from "@/components/app-sidebar/persistent-sidebar-provider"
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
        <PersistentSidebarProvider>
          <AppSidebar />
          <main className="w-full">{children}</main>
        </PersistentSidebarProvider>
      </UserSettingsProvider>
    </SessionProvider>
  )
}
