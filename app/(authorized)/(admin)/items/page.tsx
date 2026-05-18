import { listBarcodeGroups } from "@/lib/crud/barcode-groups"
import { listItems } from "@/lib/crud/items"
import { listPriceGroups } from "@/lib/crud/price-groups"
import { listUnits } from "@/lib/crud/units"
import ItemsPageClient from "./page-client"

export default async function Page() {
  const priceGroups = await listPriceGroups()
  const barcodeGroups = await listBarcodeGroups()
  const items = await listItems()
  const units = await listUnits()

  return (
    <ItemsPageClient
      priceGroups={priceGroups}
      barcodeGroups={barcodeGroups}
      items={items}
      units={units}
    />
  )
}
