import { DeleteAlert } from "@/components/delete-alert"
import { Button } from "@/components/ui/button"
import {
  deleteTransaction,
  TransactionWithRelations,
} from "@/lib/crud/transactions"
import { TrashIcon } from "@phosphor-icons/react"
import { useTranslations } from "next-intl"
import { useQueryClient } from "@tanstack/react-query"
import { invalidateTrxQueries } from "./trx-query"

export function DeleteTrxDialog({
  trx,
}: {
  trx: DeepReadonly<TransactionWithRelations>
}) {
  const t = useTranslations("transactions.history")
  const queryClient = useQueryClient()

  return (
    <DeleteAlert
      title={<>{t("table.delete")}?</>}
      description={t("table.deleteDescription")}
      action={async () => {
        await deleteTransaction(trx.id)
        await invalidateTrxQueries(queryClient)
      }}
      trigger={
        <Button variant="destructive" size="icon">
          <TrashIcon />
        </Button>
      }
    />
  )
}
