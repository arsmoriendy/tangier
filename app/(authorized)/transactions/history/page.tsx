import { listTransactions } from "@/lib/crud/transactions"
import { TrxProvider } from "./trx-ctx"
import { TrxList } from "./trx-list"
import { FiltersProvider } from "./filters-ctx"
import { Filters } from "./filters"

export default async function Page() {
  const to = new Date()
  const from = new Date(to.getTime() - 3_600_000 * 3)
  const trxList = await listTransactions({ from, to })

  return (
    <FiltersProvider initialValue={{ from, to }}>
      <TrxProvider initialValue={trxList}>
        <Filters />
        <TrxList />
      </TrxProvider>
    </FiltersProvider>
  )
}
