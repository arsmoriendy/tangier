import { AppSidebar } from "@/components/app-sidebar"
import { SidebarProvider } from "@/components/ui/sidebar"
import { SessionProvider } from "@/contexts/session-ctx"
import { authGuard } from "@/lib/auth-guard"

export default async function AuthorizedLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  const session = await authGuard()

  return (
    <SessionProvider session={session}>
      <SidebarProvider>
        <AppSidebar />
        <main className="w-full p-2">{children}</main>
      </SidebarProvider>
    </SessionProvider>
  )
}
