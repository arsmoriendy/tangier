import ItemForm from "@/app/(authorized)/items/item-form"
import { ItemCountProvider } from "@/app/(authorized)/items/item-count-ctx"
import { ItemFiltersProvider } from "@/app/(authorized)/items/item-filters-ctx"
import ItemList from "@/app/(authorized)/items/item-list"
import { BarcodeGroupsProvider } from "@/contexts/barcode-groups-ctx"
import { ItemsProvider } from "@/contexts/items-ctx"
import { PriceGroupsProvider } from "@/contexts/price-groups-ctx"
import { UnitsProvider } from "@/contexts/units-ctx"
import { listBarcodeGroups } from "@/lib/crud/barcode-groups"
import { listItems } from "@/lib/crud/items"
import { listPriceGroups } from "@/lib/crud/price-groups"
import { listUnits } from "@/lib/crud/units"
import { FieldLegend, FieldSet } from "@/components/ui/field"

export default async function Page() {
  const priceGroups = await listPriceGroups()
  const barcodeGroups = await listBarcodeGroups()
  const items = await listItems()
  const units = await listUnits()

  return (
    <BarcodeGroupsProvider barcodeGroups={barcodeGroups}>
      <PriceGroupsProvider priceGroups={priceGroups}>
        <UnitsProvider units={units}>
          <FieldSet>
            <FieldLegend>Create new item</FieldLegend>
            <ItemForm />
          </FieldSet>
          <ItemsProvider items={items}>
            <ItemFiltersProvider initialValue={{}}>
              <ItemCountProvider>
                <ItemList />
              </ItemCountProvider>
            </ItemFiltersProvider>
          </ItemsProvider>
        </UnitsProvider>
      </PriceGroupsProvider>
    </BarcodeGroupsProvider>
  )
}
