import { FieldSet } from "@/components/ui/field"
import { db } from "@/lib/db"
import { UsersProvider } from "./users-ctx"
import { UsersTable } from "./users-table"
import { Legend } from "./legend"

export default async function Page() {
  const users = await db.query.user.findMany()

  return (
    <UsersProvider users={users}>
      <FieldSet>
        <Legend />

        <UsersTable />
      </FieldSet>
    </UsersProvider>
  )
}
