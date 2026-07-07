import { listTransactions } from "@/lib/crud/transactions"
import { TrxProvider } from "./trx-ctx"
import { TrxList } from "./trx-list"
import { FiltersProvider } from "./filters-ctx"
import { Filters } from "./filters"
import { Report } from "./report"
import { listUnits } from "@/lib/crud/units"
import { listPriceGroups } from "@/lib/crud/price-groups"
import { PriceGroupsProvider } from "@/contexts/price-groups-ctx"
import { UnitsProvider } from "@/contexts/units-ctx"
import { HeldProvider } from "../held-ctx"
import { FieldLegend, FieldSet } from "@/components/ui/field"

export default async function Page() {
  const from = new Date()
  from.setHours(0, 0, 0, 0)
  const to = new Date(from)
  to.setHours(23, 59, 59, 59)

  const trxList = await listTransactions({ from, to })
  const priceGroups = await listPriceGroups()
  const units = await listUnits()

  return (
    <FiltersProvider
      initialValue={{
        to,
        from,
      }}
    >
      <HeldProvider initialValue={[]}>
        <TrxProvider initialValue={trxList}>
          <PriceGroupsProvider priceGroups={priceGroups}>
            <UnitsProvider units={units}>
              <div className="space-y-2">
                <div className="flex gap-2">
                  <FieldSet className="xl:flex-1">
                    <FieldLegend>Filters</FieldLegend>
                    <Filters />
                  </FieldSet>

                  <FieldSet className="flex-1">
                    <FieldLegend>Report</FieldLegend>
                    <Report />
                  </FieldSet>
                </div>
                <TrxList />
              </div>
            </UnitsProvider>
          </PriceGroupsProvider>
        </TrxProvider>
      </HeldProvider>
    </FiltersProvider>
  )
}
