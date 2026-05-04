import CreateUnitForm from "@/app/(authorized)/units/create-unit-form"
import UnitTable from "@/app/(authorized)/units/unit-table"
import { UnitsProvider } from "@/contexts/units-ctx"
import { listUnits } from "@/lib/crud/units"

export default async function Page() {
  const units = await listUnits()

  return (
    <UnitsProvider units={units}>
      <CreateUnitForm />
      <UnitTable />
    </UnitsProvider>
  )
}
