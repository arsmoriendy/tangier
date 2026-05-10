import { UnitsProvider } from "@/contexts/units-ctx"
import { listUnits } from "@/lib/crud/units"
import CreateUnitForm from "./create-unit-form"
import UnitTable from "./unit-table"

export default async function Page() {
  const units = await listUnits()

  return (
    <UnitsProvider units={units}>
      <CreateUnitForm />
      <UnitTable />
    </UnitsProvider>
  )
}
