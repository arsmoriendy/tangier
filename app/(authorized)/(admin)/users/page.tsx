import { db } from "@/lib/db"
import { UsersProvider } from "./users-ctx"
import { UsersTable } from "./users-table"
import { getTranslations } from "next-intl/server"
import PageHeader, { PageTitle } from "@/components/page-header"
import { UsersIcon } from "@phosphor-icons/react/dist/ssr"

export default async function Page() {
  const users = await db.query.user.findMany()
  const t = await getTranslations("users")

  return (
    <UsersProvider users={users}>
      <PageHeader>
        <UsersIcon />
        <PageTitle>{t("title")}</PageTitle>
      </PageHeader>

      <div className="px-2 pt-2">
        <UsersTable />
      </div>
    </UsersProvider>
  )
}
