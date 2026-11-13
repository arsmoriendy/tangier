import { useTxList } from "@/app/(authorized)/transactions/history/trx-ctx"
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
  const { setTxList } = useTxList()

  return (
    <DeleteAlert
      title={<>{t("table.delete")}?</>}
      description={t("table.deleteDescription")}
      action={async () => {
        await deleteTransaction(trx.id)
        const i = setTxList.findIndex((t) => t.id === trx.id)
        if (i !== -1) setTxList.splice(i, 1)
      }}
      trigger={
        <Button variant="destructive" size="icon">
          <TrashIcon />
        </Button>
      }
    />
  )
}
