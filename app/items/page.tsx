import CreateItemForm from "@/app/items/create-item-form"
import { listPriceGroups } from "@/lib/crud/price-group"

export default async function Page() {
  const priceGroups = await listPriceGroups()
  return <CreateItemForm priceGroups={priceGroups} />
}
