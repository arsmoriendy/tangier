import CreatePriceGroupForm from "@/app/price-groups/create-price-group-form"
import PriceGroupTable from "@/app/price-groups/price-group-table"
import { listPriceGroups } from "@/lib/crud/price-group"

export default async function Page() {
  const priceGroups = await listPriceGroups()

  return (
    <>
      <CreatePriceGroupForm />
      <PriceGroupTable priceGroups={priceGroups} />
    </>
  )
}
