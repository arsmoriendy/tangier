import { useHeld } from "@/app/(authorized)/transactions/held-ctx"
import { defaultTransactionValues } from "@/app/(authorized)/transactions/transaction-schema"
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
import { usePriceGroups } from "@/contexts/price-groups-ctx"
import {
  deleteTransaction,
  type TransactionWithRelations,
} from "@/lib/crud/transactions"
import { formatCurrency } from "@/lib/i18n/currency"
import { TrashIcon } from "@phosphor-icons/react"

export const RecallDialog = withForm({
  defaultValues: defaultTransactionValues,
  props: {
    open: false,
    setOpen: (_open: boolean) => {},
    recalledTrx: undefined as undefined | TransactionWithRelations,
    setRecalledTrx: (_trx: undefined | TransactionWithRelations) => {},
  },
  render: function Render({
    form,
    open,
    setOpen,
    recalledTrx,
    setRecalledTrx,
  }) {
    const { setHeld, getHeld } = useHeld()
    const { priceGroups } = usePriceGroups()

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
                <TableHead>Delete</TableHead>
              </TableRow>
            </TableHeader>

            <TableBody>
              {getHeld.map((trx, i) => {
                const date = new Date(trx.createdAt)
                return (
                  <TableRow
                    key={trx.id}
                    className="cursor-pointer"
                    onClick={async () => {
                      setRecalledTrx(trx as DeepMutable<typeof trx>)

                      form.setFieldValue(
                        "priceGroup",
                        priceGroups.find(
                          (pg) => pg.name === trx.customerPriceGroup
                        )?.id
                      )
                      form.setFieldValue("totalPrice", trx.totalPrice)
                      form.setFieldValue(
                        "transactionItems",
                        (
                          trx.transactionItems as DeepMutable<
                            typeof trx.transactionItems
                          >
                        ).map((item) => ({
                          ...item,
                          extraFields: {
                            quantifiedPrice: item.quantity * item.sellPrice,
                          },
                        }))
                      )

                      setOpen(false)
                    }}
                  >
                    <TableCell>{date.toLocaleDateString()}</TableCell>
                    <TableCell>{date.toLocaleTimeString()}</TableCell>
                    <TableCell>{trx.customerPriceGroup}</TableCell>
                    <TableCell>{trx.transactionItems.length}</TableCell>
                    <TableCell>{formatCurrency(trx.totalPrice)}</TableCell>
                    <TableCell>
                      <Button
                        className="cursor-pointer"
                        variant="destructive"
                        size="icon"
                        onClick={async (e) => {
                          e.stopPropagation()
                          if (trx.id === recalledTrx?.id) {
                            setRecalledTrx(undefined)
                            form.reset()
                          }
                          await deleteTransaction(trx.id)
                          setHeld.splice(i, 1)
                        }}
                      >
                        <TrashIcon />
                      </Button>
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
