import CreateBarcodeGroupForm from "@/app/(authorized)/barcode-groups/create-barcode-group-form"
import BarcodeGroupTable from "@/app/(authorized)/barcode-groups/barcode-group-table"
import { BarcodeGroupsProvider } from "@/contexts/barcode-groups-ctx"
import { listBarcodeGroups } from "@/lib/crud/barcode-groups"

export default async function Page() {
  const barcodeGroups = await listBarcodeGroups()
  return (
    <BarcodeGroupsProvider barcodeGroups={barcodeGroups}>
      <CreateBarcodeGroupForm />
      <BarcodeGroupTable />
    </BarcodeGroupsProvider>
  )
}
