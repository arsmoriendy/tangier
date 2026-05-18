import { SignoutButton } from "./signout-button"
import { RefreshButton } from "./refresh-button"
import { getTranslations } from "next-intl/server"

export default async function Page() {
  const t = await getTranslations("auth.inactive")

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-2">
      {t("message")}
      <div className="flex gap-2">
        <RefreshButton />
        <SignoutButton />
      </div>
    </div>
  )
}
