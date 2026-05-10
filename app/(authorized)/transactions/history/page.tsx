import { listTransactions } from "@/lib/crud/transactions"
import { TrxProvider } from "./trx-ctx"
import { TrxList } from "./trx-list"
import { FiltersProvider } from "./filters-ctx"
import { Filters } from "./filters"
import { TrxPagination } from "./trx-pagination"

export default async function Page() {
  const to = new Date()
  const from = new Date(to.getTime() - 3_600_000 * 3)
  const trxList = await listTransactions({ from, to })

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
        <div className="space-y-2">
          <Filters />
          <TrxList />
          <TrxPagination />
        </div>
      </TrxProvider>
    </FiltersProvider>
  )
}
