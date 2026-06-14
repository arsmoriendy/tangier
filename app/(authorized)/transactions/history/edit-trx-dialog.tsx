import { useTrx } from "@/app/(authorized)/transactions/history/trx-ctx"
import TransactionForm from "@/app/(authorized)/transactions/transaction-form"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { TransactionWithRelations } from "@/lib/crud/transactions"
import { PencilIcon } from "@phosphor-icons/react"
import { useTranslations } from "next-intl"
import { useState } from "react"

export function EditTrxDialog({
  trx,
}: {
  trx: DeepReadonly<TransactionWithRelations>
}) {
  const t = useTranslations("transactions.history")
  const [open, setOpen] = useState(false)
  const { setTrx } = useTrx()

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="icon">
          <PencilIcon />
        </Button>
      </DialogTrigger>

      <DialogContent className="max-h-[92vh] w-[92vw] overflow-auto pt-0 sm:max-w-[92vw]">
        <DialogTitle className="mt-2">{t("updateTransaction")}</DialogTitle>

        <TransactionForm
          transaction={trx}
          onUpdate={(trx) => {
            const i = setTrx.findIndex((t) => t.id === trx.id)
            setTrx[i] = trx
            setOpen(false)
          }}
        />
      </DialogContent>
    </Dialog>
  )
}
