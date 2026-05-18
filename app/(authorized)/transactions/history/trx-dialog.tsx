"use client"

import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { TableCell, TableRow } from "@/components/ui/table"
import { TransactionWithRelations } from "@/lib/crud/transactions"
import { formatCurrency } from "@/lib/i18n/currency"
import { useState } from "react"
import TransactionForm from "../transaction-form"
import { useTrx } from "./trx-ctx"
import { useTranslations } from "next-intl"

export function TrxDialog({
  trx,
}: {
  trx: DeepReadonly<TransactionWithRelations>
}) {
  const t = useTranslations("transactions.history")
  const [open, setOpen] = useState(false)
  const createdDate = new Date(trx.createdAt)
  const { setTrx } = useTrx()

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <TableRow className="cursor-pointer">
          <TableCell>{trx.id}</TableCell>
          <TableCell>{formatCurrency(trx.totalPrice)}</TableCell>
          <TableCell>{createdDate.toLocaleDateString()}</TableCell>
          <TableCell>{createdDate.toLocaleTimeString()}</TableCell>
        </TableRow>
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
