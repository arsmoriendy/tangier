import { getSessionOrRedirect } from "@/lib/auth-guard"

export default async function AuthorizedLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  await getSessionOrRedirect({ admin: true })

  return children
}
