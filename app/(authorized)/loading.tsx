import { Spinner } from "@/components/spinner"
import { getTranslations } from "next-intl/server"

// Fallback while an authorized route's server component fetches its data; the
// sidebar stays mounted because this sits inside the layout.
export default async function Loading() {
  const t = await getTranslations("common")

  return (
    <div role="status" className="grid min-h-svh place-items-center">
      <Spinner className="size-6" aria-hidden />
      <span className="sr-only">{t("loading")}</span>
    </div>
  )
}
