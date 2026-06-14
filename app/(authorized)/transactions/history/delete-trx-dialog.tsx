import { useTrx } from "@/app/(authorized)/transactions/history/trx-ctx"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
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
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button variant="destructive" size="icon">
          <TrashIcon />
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent size="sm">
        <AlertDialogHeader>
          <AlertDialogTitle>{t("table.delete")}?</AlertDialogTitle>
          <AlertDialogDescription>
            {t("table.deleteDescription")}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction
            variant="destructive"
            onClick={async () => {
              const i = setTrx.findIndex((t) => t.id === trx.id)
              setTrx.splice(i, 1)
              await deleteTransaction(trx.id)
            }}
          >
            <TrashIcon />
            {tc("delete")}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
