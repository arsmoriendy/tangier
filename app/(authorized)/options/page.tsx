import { listSettings } from "@/lib/crud/settings"
import OptionsForm from "./options-form"

export default async function OptionsPage() {
  const settings = await listSettings()

  return <OptionsForm initialData={settings} />
}
