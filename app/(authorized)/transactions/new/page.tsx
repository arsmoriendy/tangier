import CreateTransactionForm from "@/app/(authorized)/transactions/new/create-transaction-form"
import { PriceGroupsProvider } from "@/contexts/price-groups-ctx"
import { listPriceGroups } from "@/lib/crud/price-group"

export default async function Page() {
  const priceGroups = await listPriceGroups()
  return (
    <PriceGroupsProvider priceGroups={priceGroups}>
      <CreateTransactionForm />
    </PriceGroupsProvider>
  )
}
