import TransactionForm from "@/app/(authorized)/transactions/transaction-form"
import { PriceGroupsProvider } from "@/contexts/price-groups-ctx"
import { UnitsProvider } from "@/contexts/units-ctx"
import { listPriceGroups } from "@/lib/crud/price-groups"
import { listUnits } from "@/lib/crud/units"

export default async function Page() {
  const priceGroups = await listPriceGroups()
  const units = await listUnits()
  return (
    <PriceGroupsProvider priceGroups={priceGroups}>
      <UnitsProvider units={units}>
        <TransactionForm />
      </UnitsProvider>
    </PriceGroupsProvider>
  )
}
