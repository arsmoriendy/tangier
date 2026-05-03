import CreateTransactionForm from "@/app/(authorized)/transactions/new/create-transaction-form"
import { PriceGroupsProvider } from "@/contexts/price-groups-ctx"
import { UnitsProvider } from "@/contexts/units-ctx"
import { listPriceGroups } from "@/lib/crud/price-group"
import { listUnits } from "@/lib/crud/unit"

export default async function Page() {
  const priceGroups = await listPriceGroups()
  const units = await listUnits()
  return (
    <PriceGroupsProvider priceGroups={priceGroups}>
      <UnitsProvider units={units}>
        <CreateTransactionForm />
      </UnitsProvider>
    </PriceGroupsProvider>
  )
}
