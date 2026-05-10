import { getSession } from "@/lib/get-session"
import { redirect } from "next/navigation"

export default async function AuthorizedLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  const session = await getSession()
  if (session?.user.role !== "admin") redirect("/auth")

  return children
}
