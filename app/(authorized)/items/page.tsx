import CreateItemForm from "@/app/(authorized)/items/create-item-form"
import ItemList from "@/app/(authorized)/items/item-list"
import { BarcodeGroupsProvider } from "@/contexts/barcode-groups-ctx"
import { ItemsProvider } from "@/contexts/items-ctx"
import { PriceGroupsProvider } from "@/contexts/price-groups-ctx"
import { UnitsProvider } from "@/contexts/units-ctx"
import { listBarcodeGroups } from "@/lib/crud/barcode-group"
import { listItems } from "@/lib/crud/item"
import { listPriceGroups } from "@/lib/crud/price-group"
import { listUnits } from "@/lib/crud/unit"

export default async function Page() {
  const priceGroups = await listPriceGroups()
  const barcodeGroups = await listBarcodeGroups()
  const items = await listItems()
  const units = await listUnits()

  return (
    <BarcodeGroupsProvider barcodeGroups={barcodeGroups}>
      <PriceGroupsProvider priceGroups={priceGroups}>
        <ItemsProvider items={items}>
          <UnitsProvider units={units}>
            <CreateItemForm />
            <ItemList />
          </UnitsProvider>
        </ItemsProvider>
      </PriceGroupsProvider>
    </BarcodeGroupsProvider>
  )
}
