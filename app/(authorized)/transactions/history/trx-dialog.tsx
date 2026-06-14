"use client"

import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Table, TableBody, TableCell, TableRow } from "@/components/ui/table"
import {
  deleteTransaction,
  TransactionWithRelations,
} from "@/lib/crud/transactions"
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
import {
  EyeIcon,
  EyeSlashIcon,
  PencilIcon,
  TrashIcon,
} from "@phosphor-icons/react"
import { useLocalStorage } from "@/contexts/local-storage-ctx"
import { subscribeKey } from "valtio/utils"
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

export function TrxDialog({
  trx,
}: {
  trx: DeepReadonly<TransactionWithRelations>
}) {
  const t = useTranslations("transactions.history")
  const tc = useTranslations("common")
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
      <TableRow>
        <TableCell className="align-top">
          <span className="flex h-8 items-center">{trx.id}</span>
        </TableCell>
        <TableCell className="align-top">
          <Collapsible open={showItems} onOpenChange={setShowItems}>
            <CollapsibleTrigger asChild>
              <Button
                className="w-full"
                variant={showItems ? "destructive" : "outline"}
              >
                {showItems ? (
                  <>
                    <EyeSlashIcon />
                    {t("table.hideItems")}
                  </>
                ) : (
                  <>
                    <EyeIcon />
                    {t("table.showItems")}
                  </>
                )}
              </Button>
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
        <TableCell className="space-x-2 align-top">
          <DialogTrigger asChild>
            <Button variant="outline" size="icon">
              <PencilIcon />
            </Button>
          </DialogTrigger>

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
