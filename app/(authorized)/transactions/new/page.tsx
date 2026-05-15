import TransactionForm from "@/app/(authorized)/transactions/transaction-form"
import { PriceGroupsProvider } from "@/contexts/price-groups-ctx"
import { UnitsProvider } from "@/contexts/units-ctx"
import { listPriceGroups } from "@/lib/crud/price-groups"
import { listTransactions } from "@/lib/crud/transactions"
import { listUnits } from "@/lib/crud/units"
import { HeldProvider } from "../held-ctx"

export default async function Page() {
  const priceGroups = await listPriceGroups()
  const units = await listUnits()
  const held = await listTransactions({
    held: true,
    from: new Date(0),
    to: new Date(),
  })

  return (
    <HeldProvider initialValue={held}>
      <PriceGroupsProvider priceGroups={priceGroups}>
        <UnitsProvider units={units}>
          <TransactionForm />
        </UnitsProvider>
      </PriceGroupsProvider>
    </HeldProvider>
  )
}
