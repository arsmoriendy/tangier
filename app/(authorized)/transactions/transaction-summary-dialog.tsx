"use client"

import { defaultTransactionValues } from "@/app/(authorized)/transactions/transaction-schema"
import { withForm } from "@/components/form"
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { ButtonWithHotkeys } from "@/components/ui/button-with-hotkeys"
import { Table, TableBody, TableCell, TableRow } from "@/components/ui/table"
import { formatCurrency } from "@/lib/i18n/currency"
import { cn } from "@/lib/utils"
import { ComponentProps } from "react"

export const TransactionSummaryDialog = withForm({
  defaultValues: defaultTransactionValues,
  props: {} as ComponentProps<typeof AlertDialog>,
  render: function Render({ form, ...props }) {
    return (
      <AlertDialog {...props}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Transaction summary</AlertDialogTitle>
          </AlertDialogHeader>
          <form.Subscribe selector={(f) => f.values}>
            {(v) => {
              const expenses = v.transactionItems.reduce(
                (acc, t) => (acc += t.buyPrice),
                0
              )
              const profitLoss = v.totalPrice - expenses
              return (
                <Table>
                  <TableBody>
                    <TableRow>
                      <TableCell>Item count</TableCell>
                      <TableCell>{v.transactionItems.length}</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell>Total price</TableCell>
                      <TableCell>{formatCurrency(v.totalPrice)}</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell>Expenses</TableCell>
                      <TableCell className="text-destructive">
                        {formatCurrency(expenses)}
                      </TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell>Profit / loss</TableCell>
                      <TableCell
                        className={cn(
                          profitLoss < 0 ? "text-destructive" : "text-success"
                        )}
                      >
                        {formatCurrency(profitLoss)}
                      </TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              )
            }}
          </form.Subscribe>
          <AlertDialogFooter>
            <ButtonWithHotkeys
              hotkeys={["Enter"]}
              onClick={() => {
                props.onOpenChange?.(false)
                form.reset()
              }}
            >
              Close
            </ButtonWithHotkeys>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    )
  },
})
