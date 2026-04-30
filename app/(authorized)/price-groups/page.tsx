import CreatePriceGroupForm from "@/app/(authorized)/price-groups/create-price-group-form"
import PriceGroupTable from "@/app/(authorized)/price-groups/price-group-table"
import { PriceGroupsProvider } from "@/contexts/price-groups-ctx"
import { listPriceGroups } from "@/lib/crud/price-group"

export default async function Page() {
  const priceGroups = await listPriceGroups()

  return (
    <PriceGroupsProvider priceGroups={priceGroups}>
      <CreatePriceGroupForm />
      <PriceGroupTable />
    </PriceGroupsProvider>
  )
}
