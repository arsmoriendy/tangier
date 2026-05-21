import { listSettings } from "@/lib/crud/settings"
import ReceiptForm from "./receipt-form"

export default async function ReceiptPage() {
  const settings = await listSettings()

  return <ReceiptForm initialData={settings} />
}
