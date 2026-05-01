import { UsersProvider } from "@/app/(authorized)/users/users-ctx"
import { UsersTable } from "@/app/(authorized)/users/users-table"
import { FieldLegend, FieldSet } from "@/components/ui/field"
import { db } from "@/lib/db"

export default async function Page() {
  const users = await db.query.user.findMany()

  return (
    <UsersProvider users={users}>
      <FieldSet>
        <FieldLegend>Manage users</FieldLegend>

        <UsersTable />
      </FieldSet>
    </UsersProvider>
  )
}
