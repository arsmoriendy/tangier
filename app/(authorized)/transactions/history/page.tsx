import { listTransactions } from "@/lib/crud/transactions"
import { TrxProvider } from "./trx-ctx"
import { TrxList } from "./trx-list"
import { FiltersProvider } from "./filters-ctx"
import { Filters } from "./filters"
import { TrxPagination } from "./trx-pagination"
import { listUnits } from "@/lib/crud/units"
import { listPriceGroups } from "@/lib/crud/price-groups"
import { PriceGroupsProvider } from "@/contexts/price-groups-ctx"
import { UnitsProvider } from "@/contexts/units-ctx"

export default async function Page() {
  const to = new Date()
  const from = new Date(to.getTime() - 3_600_000 * 3)
  const trxList = await listTransactions({ from, to })
  const priceGroups = await listPriceGroups()
  const units = await listUnits()

  return (
    <FiltersProvider
      initialValue={{
        to,
        from,
        offset: 0,
        limit: 10,
      }}
    >
      <TrxProvider initialValue={trxList}>
        <PriceGroupsProvider priceGroups={priceGroups}>
          <UnitsProvider units={units}>
            <div className="space-y-2">
              <Filters />
              <TrxList />
              <TrxPagination />
            </div>
          </UnitsProvider>
        </PriceGroupsProvider>
      </TrxProvider>
    </FiltersProvider>
  )
}
