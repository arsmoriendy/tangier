import { listBarcodeGroups } from "@/lib/crud/barcode-groups"
import { listItems } from "@/lib/crud/items"
import { listPriceGroups } from "@/lib/crud/price-groups"
import { listUnits } from "@/lib/crud/units"
import { BarcodeGroupsProvider } from "@/contexts/barcode-groups-ctx"
import { PriceGroupsProvider } from "@/contexts/price-groups-ctx"
import { UnitsProvider } from "@/contexts/units-ctx"
import { FieldLegend, FieldSet } from "@/components/ui/field"
import ItemForm from "./item-form"
import { ItemsProvider } from "@/contexts/items-ctx"
import { ItemFiltersProvider } from "./item-filters-ctx"
import { ItemCountProvider } from "./item-count-ctx"
import ItemList from "./item-list"
import { getTranslations } from "next-intl/server"

export default async function Page() {
  const priceGroups = await listPriceGroups()
  const barcodeGroups = await listBarcodeGroups()
  const items = await listItems()
  const units = await listUnits()
  const t = await getTranslations("items")

  return (
    <BarcodeGroupsProvider barcodeGroups={barcodeGroups}>
      <PriceGroupsProvider priceGroups={priceGroups}>
        <UnitsProvider units={units}>
          <ItemsProvider items={items}>
            <ItemFiltersProvider initialValue={{}}>
              <ItemCountProvider>
                <FieldSet>
                  <FieldLegend>{t("createNew")}</FieldLegend>
                  <ItemForm />
                </FieldSet>
                <ItemList />
              </ItemCountProvider>
            </ItemFiltersProvider>
          </ItemsProvider>
        </UnitsProvider>
      </PriceGroupsProvider>
    </BarcodeGroupsProvider>
  )
}
