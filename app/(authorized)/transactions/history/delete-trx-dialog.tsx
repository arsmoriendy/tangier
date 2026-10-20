import { useTrx } from "@/app/(authorized)/transactions/history/trx-ctx"
import { QuickDialog } from "@/components/quick-dialog"
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
  const tc = useTranslations("common")
  const { setTrx } = useTrx()

  return (
    <QuickDialog
      title={<>{t("table.delete")}?</>}
      description={t("table.deleteDescription")}
      action={async () => {
        const i = setTrx.findIndex((t) => t.id === trx.id)
        setTrx.splice(i, 1)
        await deleteTransaction(trx.id)
      }}
      actionVariant="destructive"
      actionIcon={<TrashIcon />}
      actionLabel={tc("delete")}
      trigger={
        <Button variant="destructive" size="icon">
          <TrashIcon />
        </Button>
      }
    />
  )
}
