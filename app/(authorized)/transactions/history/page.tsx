import { dehydrate, HydrationBoundary } from "@tanstack/react-query"
import { getQueryClient } from "@/lib/query-client"
import { ReportFieldSet } from "./report-fieldset"
import { TrxList } from "./trx-list"
import { FiltersProvider } from "./filters-ctx"
import { Filters } from "./filters"
import { trxListQueryOptions } from "./trx-query"
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

  const filters = { id: "", from, to }

  const [priceGroups, units] = await Promise.all([
    listPriceGroups(),
    listUnits(),
  ])

  // the first page is fetched on the server and hydrated into the query cache,
  // so the client starts with rows instead of a loading state and only asks for
  // more when the list is scrolled
  const queryClient = getQueryClient()
  await queryClient.prefetchInfiniteQuery(trxListQueryOptions(filters))

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <FiltersProvider initialValue={filters}>
        <HeldProvider initialValue={[]}>
          <PriceGroupsProvider priceGroups={priceGroups}>
            <UnitsProvider units={units}>
              <div className="flex h-svh flex-col gap-2 overflow-hidden">
                <div className="flex max-h-[50svh] shrink-0 justify-stretch gap-2 overflow-auto px-2 pt-2">
                  <FieldSet className="xl:flex-1">
                    <FieldLegend>Filters</FieldLegend>
                    <Filters />
                  </FieldSet>
                  <ReportFieldSet />
                </div>

                <TrxList />
              </div>
            </UnitsProvider>
          </PriceGroupsProvider>
        </HeldProvider>
      </FiltersProvider>
    </HydrationBoundary>
  )
}
