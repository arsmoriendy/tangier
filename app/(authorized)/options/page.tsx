import { listSettings } from "@/lib/crud/settings"
import OptionsForm from "./options-form"
import { getTranslations } from "next-intl/server"
import PageHeader, { PageTitle } from "@/components/page-header"
import { GearFineIcon } from "@phosphor-icons/react/dist/ssr"

export default async function OptionsPage() {
  const settings = await listSettings()
  const t = await getTranslations("options")

  return (
    <div className="space-y-2">
      <PageHeader>
        <GearFineIcon />
        <PageTitle>{t("title")}</PageTitle>
      </PageHeader>

      <div className="px-2">
        <OptionsForm initialData={settings} />
      </div>
    </div>
  )
}
