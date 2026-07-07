import { useTrx } from "@/app/(authorized)/transactions/history/trx-ctx"
import TransactionForm from "@/app/(authorized)/transactions/transaction-form"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { TransactionWithRelations } from "@/lib/crud/transactions"
import { PencilIcon, XIcon } from "@phosphor-icons/react"
import { useState } from "react"

export function EditTrxDialog({
  trx,
}: {
  trx: DeepReadonly<TransactionWithRelations>
}) {
  const [open, setOpen] = useState(false)
  const { setTrx } = useTrx()

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="icon">
          <PencilIcon />
        </Button>
      </DialogTrigger>

      <DialogContent
        className="max-h-[92vh] w-[92vw] p-0 sm:max-w-[92vw]"
        showCloseButton={false}
      >
        <DialogTitle className="hidden" />

        <Button
          size="icon-xs"
          className="absolute -top-3 right-4 z-50 bg-destructive"
          asChild
        >
          <DialogClose>
            <XIcon />
          </DialogClose>
        </Button>

        <div className="max-h-[92vh] overflow-auto p-4 pb-0">
          <TransactionForm
            transaction={trx}
            onUpdate={(trx) => {
              const i = setTrx.findIndex((t) => t.id === trx.id)
              setTrx[i] = trx
              setOpen(false)
            }}
          />
        </div>
      </DialogContent>
    </Dialog>
  )
}
