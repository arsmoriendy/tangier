"use client"

import { BarcodeGroupsProvider } from "@/contexts/barcode-groups-ctx"
import { ItemsProvider } from "@/contexts/items-ctx"
import { PriceGroupsProvider } from "@/contexts/price-groups-ctx"
import { UnitsProvider } from "@/contexts/units-ctx"
import { FieldLegend, FieldSet } from "@/components/ui/field"
import ItemForm from "./item-form"
import { ItemFiltersProvider } from "./item-filters-ctx"
import { ItemCountProvider } from "./item-count-ctx"
import ItemList from "./item-list"
import { useTranslations } from "next-intl"

interface PageProps {
  priceGroups: any[]
  barcodeGroups: any[]
  items: any[]
  units: any[]
}

export default function ItemsPageClient({
  priceGroups,
  barcodeGroups,
  items,
  units,
}: PageProps) {
  const t = useTranslations("items")

  return (
    <BarcodeGroupsProvider barcodeGroups={barcodeGroups}>
      <PriceGroupsProvider priceGroups={priceGroups}>
        <UnitsProvider units={units}>
          <FieldSet>
            <FieldLegend>{t("createNew")}</FieldLegend>
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
