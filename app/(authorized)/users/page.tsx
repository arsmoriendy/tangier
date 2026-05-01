import { UsersProvider } from "@/app/(authorized)/users/users-ctx"
import { UsersTable } from "@/app/(authorized)/users/users-table"
import { db } from "@/lib/db"

export default async function Page() {
  const users = await db.query.user.findMany()

  return (
    <UsersProvider users={users}>
      <UsersTable />
    </UsersProvider>
  )
}
