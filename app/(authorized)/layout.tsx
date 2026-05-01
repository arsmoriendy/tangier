import { AppSidebar } from "@/components/app-sidebar"
import { SidebarProvider } from "@/components/ui/sidebar"
import { SessionProvider } from "@/contexts/session-ctx"
import { auth } from "@/lib/auth"
import { headers } from "next/headers"
import { redirect } from "next/navigation"

export default async function AuthorizedLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  const session = await auth.api.getSession({
    headers: await headers(),
  })

  if (!session) redirect("/auth")

  return (
    <SessionProvider session={session}>
      <SidebarProvider>
        <AppSidebar />
        <main className="w-full p-2">{children}</main>
      </SidebarProvider>
    </SessionProvider>
  )
}
