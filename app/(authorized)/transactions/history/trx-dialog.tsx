"use client"

import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Table, TableBody, TableCell, TableRow } from "@/components/ui/table"
import { TransactionWithRelations } from "@/lib/crud/transactions"
import { formatCurrency } from "@/lib/i18n/currency"
import { useEffect, useState } from "react"
import TransactionForm from "../transaction-form"
import { useTrx } from "./trx-ctx"
import { useTranslations } from "next-intl"
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible"
import { Button } from "@/components/ui/button"
import { PencilIcon } from "@phosphor-icons/react"
import { useLocalStorage } from "@/contexts/local-storage-ctx"
import { subscribeKey } from "valtio/utils"

export function TrxDialog({
  trx,
}: {
  trx: DeepReadonly<TransactionWithRelations>
}) {
  const t = useTranslations("transactions.history")
  const [open, setOpen] = useState(false)
  const createdDate = new Date(trx.createdAt)
  const { setTrx } = useTrx()
  const { setLocalStorage } = useLocalStorage()
  const [showItems, setShowItems] = useState(false)

  useEffect(() => {
    setShowItems(setLocalStorage.showHisotryItems)
    const unsub = subscribeKey(
      setLocalStorage,
      "showHisotryItems",
      setShowItems
    )
    return unsub
  }, [])

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <TableRow className="group relative">
        <TableCell className="align-top">
          <span className="flex h-8 items-center">{trx.id}</span>
        </TableCell>
        <TableCell className="align-top">
          <Collapsible open={showItems} onOpenChange={setShowItems}>
            <CollapsibleTrigger asChild>
              <Button className="w-full">{t("table.showItems")}</Button>
            </CollapsibleTrigger>
            <CollapsibleContent>
              <Table>
                <TableBody>
                  {trx.transactionItems.map((item, i) => (
                    <TableRow key={i}>
                      <TableCell>{item.name}</TableCell>
                      <TableCell>{formatCurrency(item.sellPrice)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CollapsibleContent>
          </Collapsible>
        </TableCell>
        <TableCell className="align-top">
          <span className="flex h-8 items-center">
            {formatCurrency(trx.totalPrice)}
          </span>
        </TableCell>
        <TableCell className="align-top">
          <span className="flex h-8 items-center">
            {createdDate.toLocaleDateString()}
          </span>
        </TableCell>
        <TableCell className="align-top">
          <span className="flex h-8 items-center">
            {createdDate.toLocaleTimeString()}
          </span>
        </TableCell>
        <TableCell className="absolute top-0 left-0 hidden group-hover:flex">
          <DialogTrigger asChild>
            <Button>
              <PencilIcon />
              Edit
            </Button>
          </DialogTrigger>
        </TableCell>
      </TableRow>

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
