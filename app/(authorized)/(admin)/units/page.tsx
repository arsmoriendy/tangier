import { UnitsProvider } from "@/contexts/units-ctx"
import { listUnits } from "@/lib/crud/units"
import CreateUnitForm from "./create-unit-form"
import UnitTable from "./unit-table"
import PageHeader, { PageTitle } from "@/components/page-header"
import { getTranslations } from "next-intl/server"
import { TagIcon } from "@phosphor-icons/react/dist/ssr"

export default async function Page() {
  const units = await listUnits()
  const tc = await getTranslations("common")

  return (
    <UnitsProvider units={units}>
      <PageHeader>
        <TagIcon />
        <PageTitle>{tc("unit")}</PageTitle>
      </PageHeader>

      <div className="space-y-2 px-2 pt-2">
        <CreateUnitForm />
        <UnitTable />
      </div>
    </UnitsProvider>
  )
}
