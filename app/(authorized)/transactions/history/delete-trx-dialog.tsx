import { useTrx } from "@/app/(authorized)/transactions/history/trx-ctx"
import { DeleteAlert } from "@/components/delete-alert"
import { Button } from "@/components/ui/button"
import {
  deleteTransaction,
  TransactionWithRelations,
} from "@/lib/crud/transactions"
import { TrashIcon } from "@phosphor-icons/react"
import { useTranslations } from "next-intl"

export function DeleteTrxDialog({
  trx,
}: {
  trx: DeepReadonly<TransactionWithRelations>
}) {
  const t = useTranslations("transactions.history")
  const { setTrx } = useTrx()

  return (
    <DeleteAlert
      title={<>{t("table.delete")}?</>}
      description={t("table.deleteDescription")}
      action={async () => {
        const i = setTrx.findIndex((t) => t.id === trx.id)
        setTrx.splice(i, 1)
        await deleteTransaction(trx.id)
      }}
      trigger={
        <Button variant="destructive" size="icon">
          <TrashIcon />
        </Button>
      }
    />
  )
}
