import CreateItemForm from "@/app/(authorized)/items/create-item-form"
import { BarcodeGroupsProvider } from "@/contexts/barcode-groups-ctx"
import { ItemsProvider } from "@/contexts/items-ctx"
import { PriceGroupsProvider } from "@/contexts/price-groups-ctx"
import { listBarcodeGroups } from "@/lib/crud/barcode-group"
import { listItems } from "@/lib/crud/item"
import { listPriceGroups } from "@/lib/crud/price-group"

export default async function Page() {
  const priceGroups = await listPriceGroups()
  const barcodeGroups = await listBarcodeGroups()
  const items = await listItems()

  return (
    <BarcodeGroupsProvider barcodeGroups={barcodeGroups}>
      <PriceGroupsProvider priceGroups={priceGroups}>
        <ItemsProvider items={items}>
          <CreateItemForm />
        </ItemsProvider>
      </PriceGroupsProvider>
    </BarcodeGroupsProvider>
  )
}
