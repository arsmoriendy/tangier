import { useHeld } from "@/app/(authorized)/transactions/held-ctx"
import { defaultTransactionValues } from "@/app/(authorized)/transactions/transaction-schema"
import { DeleteAlert } from "@/components/delete-alert"
import { withForm } from "@/components/form"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  deleteTransaction,
  type TransactionWithRelations,
} from "@/lib/crud/transactions"
import { formatCurrency } from "@/lib/i18n/currency"
import { TrashIcon, ClockCountdownIcon } from "@phosphor-icons/react"
import { useFormatter, useTranslations } from "next-intl"
import { useEffect } from "react"

export const RecallDialog = withForm({
  defaultValues: defaultTransactionValues,
  props: {
    open: false,
    setOpen: (_open: boolean) => {},
    recalledTrx: undefined as undefined | TransactionWithRelations,
    onReset: () => {},
    recallTrx: (_trx: DeepReadonly<TransactionWithRelations>) => {},
  },
  render: function Render({ open, setOpen, recalledTrx, onReset, recallTrx }) {
    const { setHeld, getHeld } = useHeld()
    const format = useFormatter()
    const t = useTranslations("transactions.recall")
    const tc = useTranslations("common")

    // automatically recall if only 1 transaction is held
    useEffect(() => {
      if (open && setHeld.length === 1) {
        recallTrx(setHeld[0])
      }
    }, [open])

    return (
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-2xl">
          <DialogTitle>Recall transaction</DialogTitle>

          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Time</TableHead>
                <TableHead>Customer</TableHead>
                <TableHead>Item count</TableHead>
                <TableHead>Total price</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>

            <TableBody>
              {getHeld.map((trx, i) => {
                const date = new Date(trx.createdAt)
                return (
                  <TableRow key={trx.id}>
                    <TableCell>{format.dateTime(date)}</TableCell>
                    <TableCell>
                      {format.dateTime(date, {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </TableCell>
                    <TableCell>{trx.customerPriceGroup}</TableCell>
                    <TableCell>{trx.transactionItems.length}</TableCell>
                    <TableCell>{formatCurrency(trx.totalPrice)}</TableCell>
                    <TableCell className="flex gap-2">
                      <Button onClick={() => recallTrx(trx)}>
                        <ClockCountdownIcon /> Recall
                      </Button>
                      <DeleteAlert
                        title={<>{tc("delete")}?</>}
                        description={t("deleteDescription")}
                        action={async () => {
                          if (trx.id === recalledTrx?.id) onReset()
                          await deleteTransaction(trx.id)
                          setHeld.splice(i, 1)
                        }}
                        trigger={
                          <Button variant="destructive" size="icon">
                            <TrashIcon />
                          </Button>
                        }
                      />
                    </TableCell>
                  </TableRow>
                )
              })}
            </TableBody>
          </Table>
        </DialogContent>
      </Dialog>
    )
  },
})
