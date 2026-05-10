import { BarcodeGroupsProvider } from "@/contexts/barcode-groups-ctx"
import { listBarcodeGroups } from "@/lib/crud/barcode-groups"
import BarcodeGroupTable from "./barcode-group-table"
import CreateBarcodeGroupForm from "./create-barcode-group-form"

export default async function Page() {
  const barcodeGroups = await listBarcodeGroups()
  return (
    <BarcodeGroupsProvider barcodeGroups={barcodeGroups}>
      <CreateBarcodeGroupForm />
      <BarcodeGroupTable />
    </BarcodeGroupsProvider>
  )
}
