import { PriceGroupsProvider } from "@/contexts/price-groups-ctx"
import { listPriceGroups } from "@/lib/crud/price-groups"
import CreatePriceGroupForm from "./create-price-group-form"
import PriceGroupTable from "./price-group-table"

export default async function Page() {
  const priceGroups = await listPriceGroups()

  return (
    <PriceGroupsProvider priceGroups={priceGroups}>
      <CreatePriceGroupForm />
      <PriceGroupTable />
    </PriceGroupsProvider>
  )
}
