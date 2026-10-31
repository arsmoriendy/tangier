import { PriceGroupsProvider } from "@/contexts/price-groups-ctx"
import { listPriceGroups } from "@/lib/crud/price-groups"
import CreatePriceGroupForm from "./create-price-group-form"
import PriceGroupTable from "./price-group-table"
import { getTranslations } from "next-intl/server"
import PageHeader, { PageTitle } from "@/components/page-header"
import { MoneyIcon } from "@phosphor-icons/react/dist/ssr"

export default async function Page() {
  const priceGroups = await listPriceGroups()
  const t = await getTranslations("sidebar")

  return (
    <PriceGroupsProvider priceGroups={priceGroups}>
      <PageHeader>
        <MoneyIcon />
        <PageTitle>{t("priceGroups")}</PageTitle>
      </PageHeader>

      <div className="px- pt-2">
        <CreatePriceGroupForm />
        <PriceGroupTable />
      </div>
    </PriceGroupsProvider>
  )
}
