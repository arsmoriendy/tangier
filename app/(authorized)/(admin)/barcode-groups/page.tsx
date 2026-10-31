import { BarcodeGroupsProvider } from "@/contexts/barcode-groups-ctx"
import { listBarcodeGroups } from "@/lib/crud/barcode-groups"
import BarcodeGroupTable from "./barcode-group-table"
import CreateBarcodeGroupForm from "./create-barcode-group-form"
import { getTranslations } from "next-intl/server"
import PageHeader, { PageTitle } from "@/components/page-header"
import { BarcodeIcon } from "@phosphor-icons/react/dist/ssr"

export default async function Page() {
  const barcodeGroups = await listBarcodeGroups()
  const t = await getTranslations("sidebar")
  return (
    <>
      <PageHeader>
        <BarcodeIcon />
        <PageTitle>{t("barcodeGroups")}</PageTitle>
      </PageHeader>

      <div className="px-2 pt-2">
        <BarcodeGroupsProvider barcodeGroups={barcodeGroups}>
          <CreateBarcodeGroupForm />
          <BarcodeGroupTable />
        </BarcodeGroupsProvider>
      </div>
    </>
  )
}
