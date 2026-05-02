import CreateItemForm from "@/app/(authorized)/items/create-item-form"
import { BarcodeGroupsProvider } from "@/contexts/barcode-groups-ctx"
import { listBarcodeGroups } from "@/lib/crud/barcode-group"
import { listPriceGroups } from "@/lib/crud/price-group"

export default async function Page() {
  const priceGroups = await listPriceGroups()
  const barcodeGroups = await listBarcodeGroups()

  return (
    <BarcodeGroupsProvider barcodeGroups={barcodeGroups}>
      <CreateItemForm priceGroups={priceGroups} />
    </BarcodeGroupsProvider>
  )
}
