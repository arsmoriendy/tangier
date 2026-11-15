"use client"

import { useIsAdmin } from "@/components/admin-only"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Skeleton } from "@/components/ui/skeleton"
import { ChartLineIcon } from "@phosphor-icons/react/dist/ssr"
import { useTranslations } from "next-intl"
import dynamic from "next/dynamic"

// the report pulls in recharts and the color helper, so it is only downloaded
// once an admin actually opens the dialog
const ReportContent = dynamic(
  () => import("./report").then((mod) => mod.ReportContent),
  {
    ssr: false,
    loading: () => <Skeleton className="h-72 w-full" />,
  }
)

export function ReportDialog() {
  const isAdmin = useIsAdmin()
  const t = useTranslations("transactions.history.report")

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button disabled={!isAdmin} type="button">
          <ChartLineIcon />
          {t("legend")}
        </Button>
      </DialogTrigger>
      {isAdmin && (
        <DialogContent className="max-h-[92vh] overflow-auto">
          <DialogTitle>{t("title")}</DialogTitle>
          <ReportContent />
        </DialogContent>
      )}
    </Dialog>
  )
}
