"use client"

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { useTrx } from "./trx-ctx"
import { formatCurrency } from "@/lib/i18n/currency"
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import TransactionForm from "../transaction-form"

export function TrxList() {
  const { getTrx } = useTrx()
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Id</TableHead>
          <TableHead>Total price</TableHead>
          <TableHead>Date</TableHead>
          <TableHead>Time</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {getTrx.map((trx, i) => {
          const createdDate = new Date(trx.createdAt)
          return (
            <Dialog key={i}>
              <DialogTrigger asChild>
                <TableRow className="cursor-pointer">
                  <TableCell>{trx.id}</TableCell>
                  <TableCell>{formatCurrency(trx.totalPrice)}</TableCell>
                  <TableCell>{createdDate.toLocaleDateString()}</TableCell>
                  <TableCell>{createdDate.toLocaleTimeString()}</TableCell>
                </TableRow>
              </DialogTrigger>

              <DialogContent className="max-h-[92vh] w-[92vw] overflow-auto pt-0 sm:max-w-[92vw]">
                <DialogTitle className="mt-2">Update transaction</DialogTitle>

                <TransactionForm transaction={trx} />
              </DialogContent>
            </Dialog>
          )
        })}
      </TableBody>
    </Table>
  )
}
